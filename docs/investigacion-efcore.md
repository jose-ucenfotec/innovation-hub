# Investigación breve: EF Core en el Innovation Hub

Con la documentación oficial y ejemplos de [`modelo-datos.md`](modelo-datos.md) y [`rutas.md`](rutas.md).

## 1. Datos relacionados: `Select`, `Include` y `AsNoTracking`

**`Include`** (carga ansiosa) trae las entidades **completas** junto con sus relacionadas, y `ThenInclude` baja un nivel más [1]. Para la ruta 1, `GET /api/initiatives/{id}`:

```csharp
db.Iniciativas.Include(i => i.Categoria).Include(i => i.Propietario).Include(i => i.Competencias)
  .Include(i => i.Miembros).ThenInclude(m => m.Usuario).AsNoTracking().FirstOrDefaultAsync(i => i.Id == id);
```

Trae todas las columnas, incluso el `ContrasenaHash` de cada usuario, y varias colecciones del mismo nivel producen una **explosión cartesiana** de filas, que se evita con `AsSplitQuery()` [6].

**La proyección con `Select`** pide solo las columnas que usa la respuesta, y la documentación la recomienda para consultas de solo lectura [3]:

```csharp
db.Iniciativas.Where(i => i.Id == id).Select(i => new InitiativeDetailDto {
    Id = i.Id.ToString(), Title = i.Titulo, MemberCount = i.Miembros.Count() + 1,
    RequiredSkills = i.Competencias.OrderBy(c => c.Nombre).Select(c => new SkillDto { Id = c.Id, Name = c.Nombre }).ToList(),
    Members = i.Miembros.OrderBy(m => m.FechaIngreso).Select(m => new MemberDto {
        UserId = m.UsuarioId.ToString(), Role = new RoleDto { Id = m.Rol.Id, Name = m.Rol.Nombre } }).ToList() })
  .FirstOrDefaultAsync();
```

El SQL generado lleva solo esas columnas y un `COUNT` como subconsulta, como la consulta 1 de la ruta 1, y el DTO con la forma del contrato impide que se filtre un campo de más.

**`AsNoTracking`** evita que EF Core *rastree* las entidades, es decir, que guarde una copia para detectar cambios en `SaveChanges`. Conviene para solo lectura y suele ser más rápido [2]: en la medición de la documentación tardó cerca del 71 % [3]. La proyección no lo necesita, porque un resultado sin entidades no se rastrea [2].

**Conclusión:** `Select` en las rutas GET; `Include` con rastreo solo cuando se va a **modificar** lo cargado, como al aceptar una solicitud: se carga la `Iniciativa` con sus `Miembros`, se agrega uno y se llama a `SaveChanges`.

## 2. Muchos a muchos con datos propios

La tabla intermedia es una *join entity type* [4], y hay dos formas de modelarla:

- **Sin clase**, cuando **solo tiene las dos llaves**: bastan dos *skip navigations*, una lista en cada lado [4]. Es el caso de **`IniciativaCompetencias`**:

  ```csharp
  modelBuilder.Entity<Iniciativa>().HasMany(i => i.Competencias).WithMany(c => c.Iniciativas)
      .UsingEntity("IniciativaCompetencias");
  ```

- **Con entidad intermedia**, cuando guarda **datos propios** (*payload*): la documentación recomienda una clase [4]. Es el caso de **`IniciativaMiembros`**, con `FechaIngreso` (el `joinedAt`) y `RolId`, una llave foránea a `Roles` que necesita su navegación para `role { id, name }`. Una `List<Usuario>` no tendría dónde guardarlos:

  ```csharp
  public class IniciativaMiembro {
      public int IniciativaId { get; set; }  public int UsuarioId { get; set; }  public string RolId { get; set; } = null!;
      public DateTime FechaIngreso { get; set; }  public Usuario Usuario { get; set; } = null!;  public Rol Rol { get; set; } = null!; }
  modelBuilder.Entity<IniciativaMiembro>().HasKey(m => new { m.IniciativaId, m.UsuarioId });
  ```

  **`UsuarioCompetencias`** también lleva clase, por el `Nivel`. La entidad puede convivir con *skip navigations* [4].

## 3. Paginación en la base: `Skip` y `Take`

`Skip(n)` salta `n` filas y `Take(m)` toma las `m` siguientes. La documentación indica que corresponden a `OFFSET` y `LIMIT` en SQL [5], que en SQL Server se escriben `OFFSET … ROWS FETCH NEXT … ROWS ONLY` [7]. Para la ruta 2, `GET /api/initiatives?category=cat-sistemas&page=1&size=9`:

```csharp
var q = db.Iniciativas.Where(i => i.Visibilidad != "private" && i.Estado != "draft" && i.Estado != "archived"
                               && i.CategoriaId == categoria);
var totalItems = await q.CountAsync();
var items = await q.OrderByDescending(i => i.CreadoEn).ThenBy(i => i.Id)
    .Skip((page - 1) * size).Take(size).Select(i => new InitiativeItemDto { /* … */ }).ToListAsync();
```

Se espera `… ORDER BY [CreadoEn] DESC, [Id] OFFSET @p0 ROWS FETCH NEXT @p1 ROWS ONLY`, la consulta 2 de esa ruta, y se confirma con `.ToQueryString()`.

- **Orden único** [5][7]: sin `ORDER BY` no hay orden garantizado, y solo por fecha dos iniciativas del mismo instante podrían repetirse entre páginas. Por eso va `ThenBy(i => i.Id)`, como hoy Express desempata por `_id`.
- **Límites de `OFFSET`**: la base recorre igual las filas saltadas, y los cambios concurrentes pueden repetir o perder filas. Paginar por llave es más eficiente, pero no permite saltar a una página [5]; el contrato pide `page`, así que se usa `Skip`/`Take` con índices acordes al orden.
- **No paginar en memoria**: `ToListAsync()` carga todo lo que devuelve la consulta [3]. Llamado antes de `Skip`/`Take`, traería **todas** las iniciativas para mostrar 9; con 8 datos de prueba no se nota, justo lo que advierte la documentación [3]. Por eso `Skip`/`Take` van antes, y la base cuenta el total, como `paginar()` en Express.

## Fuentes (learn.microsoft.com)

[1] [Eager Loading of Related Data](https://learn.microsoft.com/ef/core/querying/related-data/eager) · [2] [Tracking vs. No-Tracking Queries](https://learn.microsoft.com/ef/core/querying/tracking) · [3] [Efficient Querying](https://learn.microsoft.com/ef/core/performance/efficient-querying) · [4] [Many-to-many relationships](https://learn.microsoft.com/ef/core/modeling/relationships/many-to-many) · [5] [Pagination](https://learn.microsoft.com/ef/core/querying/pagination) · [6] [Single vs. Split Queries](https://learn.microsoft.com/ef/core/querying/single-split-queries) · [7] [ORDER BY Clause (Transact-SQL)](https://learn.microsoft.com/sql/t-sql/queries/select-order-by-clause-transact-sql)
