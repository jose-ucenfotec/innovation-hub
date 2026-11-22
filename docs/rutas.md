# Diseño de dos rutas de lectura sobre SQL Server

Son dos rutas `GET` del contrato del Avance 2 que **no requieren iniciar sesión** (en `docs/api-contract.md` su autenticación es «opcional»). Las dos muestran relaciones muchos a muchos.

Para cada ruta está:
- **la ruta y qué devuelve**;
- **las tablas que lee y la consulta SQL**;
- **cómo se arma la respuesta**;
- **el JSON** con los datos de prueba (`modelo-datos.md`, «Plan de migración», paso 5).

**Qué JSON es este:** es el que responde hoy el servidor Express, con los mismos nombres de campo, porque se generó con sus propios serializadores (`servidor/src/utils/serializadores.js`). La única diferencia es que los ids son los de SQL Server, **como texto** (`"id": "1"`).

**Tres convenciones de ambas rutas:**
- **Visitante sin sesión.** No hay usuario, así que nadie es dueño ni miembro, y la visibilidad decide el nivel de acceso (RN-20).
- **Fechas en UTC con formato ISO** (`"2026-09-08T15:00:00.000Z"`), igual que Express. En .NET se serializan las columnas `DATETIME2` como UTC.
- **Orden de las listas.** MongoDB devuelve los arreglos en el orden en que se guardaron. Una consulta SQL **sin `ORDER BY` no garantiza ningún orden**, así que las consultas ordenan explícitamente: competencias por nombre, etiquetas alfabéticamente y miembros por fecha de ingreso. El JSON de abajo ya sigue ese orden.

---

## Ruta 1 · `GET /api/initiatives/{id}` · el detalle de una iniciativa

**Qué devuelve:** un `InitiativeDetail` (acceso `full`) o un `InitiativeSummary` (acceso `summary`). Si la iniciativa es institucional y no hay sesión responde 401, y si es privada o no existe responde 404.

**Ejemplo:** `GET /api/initiatives/1`, «Plataforma de mentorías de programación», que es **pública**, así que un visitante la ve completa.

### Tablas que lee

| Tabla | Para qué | Relación |
|---|---|---|
| `Iniciativas` | Los datos de la iniciativa | — |
| `Categorias` | `category { id, name, icon }` | 1 a muchos (`Iniciativas.CategoriaId`) |
| `Usuarios` | `owner.fullName`, y el nombre y la carrera de cada miembro | 1 a muchos (`Iniciativas.PropietarioId`) |
| `Proyectos` | `projectId`, o `null` si no se convirtió | 1 a 1 (`Proyectos.IniciativaId` UNIQUE) |
| `IniciativaCompetencias` + `Competencias` | `requiredSkills[]` | **muchos a muchos** |
| `IniciativaEtiquetas` | `tags[]` | 1 a muchos |
| `IniciativaMiembros` + `Usuarios` + `Roles` | `members[]` con su rol y fecha | **muchos a muchos con datos propios** |

### Consulta SQL

Son cuatro consultas pequeñas, una por cada lista, en lugar de un solo JOIN enorme. Un solo JOIN repetiría la fila de la iniciativa por cada combinación de competencia × etiqueta × miembro, un **producto cartesiano**. Es lo mismo que hace EF Core con `AsSplitQuery()`.

```sql
DECLARE @id INT = 1;

-- 1) La iniciativa con su categoría, su propietario y su proyecto (si tiene)
SELECT i.Id, i.Titulo, i.Tipo, i.Resumen, i.Descripcion, i.Problema, i.Beneficiarios,
       i.Visibilidad, i.Estado, i.IntegrantesEstimados, i.CreadoEn, i.ActualizadoEn,
       c.Id AS CategoriaId, c.Nombre AS CategoriaNombre, c.Icono AS CategoriaIcono,
       u.Id AS PropietarioId,
       CONCAT_WS(N' ', u.Nombre, u.PrimerApellido, u.SegundoApellido) AS PropietarioNombre,
       p.Id AS ProyectoId,
       (SELECT COUNT(*) FROM IniciativaMiembros m WHERE m.IniciativaId = i.Id) AS CantidadMiembros
FROM Iniciativas AS i
INNER JOIN Categorias AS c ON c.Id = i.CategoriaId
INNER JOIN Usuarios   AS u ON u.Id = i.PropietarioId
LEFT  JOIN Proyectos  AS p ON p.IniciativaId = i.Id
WHERE i.Id = @id;

-- 2) Competencias requeridas: muchos a muchos, a través de la tabla intermedia
SELECT co.Id, co.Nombre
FROM IniciativaCompetencias AS ic
INNER JOIN Competencias AS co ON co.Id = ic.CompetenciaId
WHERE ic.IniciativaId = @id
ORDER BY co.Nombre;

-- 3) Etiquetas
SELECT e.Etiqueta
FROM IniciativaEtiquetas AS e
WHERE e.IniciativaId = @id
ORDER BY e.Etiqueta;

-- 4) Equipo: muchos a muchos con datos propios (rol y fecha de ingreso)
SELECT m.UsuarioId,
       CONCAT_WS(N' ', u.Nombre, u.PrimerApellido, u.SegundoApellido) AS NombreCompleto,
       u.Carrera, r.Id AS RolId, r.Nombre AS RolNombre, m.FechaIngreso
FROM IniciativaMiembros AS m
INNER JOIN Usuarios AS u ON u.Id = m.UsuarioId
INNER JOIN Roles    AS r ON r.Id = m.RolId
WHERE m.IniciativaId = @id
ORDER BY m.FechaIngreso, m.UsuarioId;
```

**Lo que devuelve cada consulta con los datos de prueba:**
1. Una fila: Mentorías, `cat-educacion`, propietario 1 «Leonardo Brenes Arias», `ProyectoId` NULL, `CantidadMiembros` 1.
2. Tres filas: Desarrollo web (JavaScript y React), Diseño UX/UI y Gestión ágil (Scrum).
3. Dos filas: mentorías y programación.
4. Una fila: 2, Donatello Quirós, Ciberseguridad, rol-backend, 2026-09-12 15:00.

### Cómo se arma la respuesta

| Campo del JSON | Sale de |
|---|---|
| `id`, `owner.id`, `members[].userId`, `projectId` | `Id` de cada tabla, convertido a texto. `projectId` es `null` si el `LEFT JOIN` no encontró proyecto |
| `accessLevel` | La regla de visibilidad sobre `Visibilidad`: `public` → `"full"`. Sin sesión, `institutional` → 401, `restricted` → `"summary"` y `private` → 404. Con `summary` solo se envían `id`, `accessLevel`, `title`, `type`, `summary`, `category`, `requiredSkills` y `visibility`, y no hace falta leer las consultas 3 y 4 |
| `title`, `type`, `summary`, `visibility`, `status`, `estimatedMembers`, `description`, `problem`, `beneficiaries` | Columnas de `Iniciativas` (`Titulo`, `Tipo`, …) |
| `category` | `Categorias` |
| `requiredSkills[]` | Consulta 2 |
| `tags[]` | Consulta 3 |
| `memberCount` | `CantidadMiembros + 1`: el propietario cuenta (RN-16) → 1 + 1 = **2** |
| `availableSpots` | `IntegrantesEstimados − memberCount` → 4 − 2 = **2** |
| `owner.fullName`, `members[].fullName` | `CONCAT_WS` de nombre y apellidos (omite el segundo apellido si es NULL) |
| `members[]` | Consulta 4. `role` es `{ id, name }` del rol |
| `createdAt`, `updatedAt`, `members[].joinedAt` | `CreadoEn`, `ActualizadoEn` y `FechaIngreso`, en ISO UTC |

### JSON que respondería

```json
{
  "id": "1",
  "accessLevel": "full",
  "title": "Plataforma de mentorías de programación",
  "type": "idea",
  "summary": "Conectar estudiantes avanzados de software con quienes empiezan a programar.",
  "category": {
    "id": "cat-educacion",
    "name": "Educación y mentorías",
    "icon": "bi-mortarboard"
  },
  "requiredSkills": [
    {
      "id": "comp-desarrollo-web",
      "name": "Desarrollo web (JavaScript y React)"
    },
    {
      "id": "comp-diseno-ux",
      "name": "Diseño UX/UI"
    },
    {
      "id": "comp-gestion-agil",
      "name": "Gestión ágil (Scrum)"
    }
  ],
  "visibility": "public",
  "tags": [
    "mentorías",
    "programación"
  ],
  "status": "forming",
  "estimatedMembers": 4,
  "memberCount": 2,
  "availableSpots": 2,
  "owner": {
    "id": "1",
    "fullName": "Leonardo Brenes Arias"
  },
  "projectId": null,
  "createdAt": "2026-09-08T15:00:00.000Z",
  "updatedAt": "2026-09-20T15:00:00.000Z",
  "description": "Hoy las mentorías se coordinan por chat y dependen de conocidos. Proponemos una plataforma para publicar horarios, emparejar mentores por tecnología y registrar las sesiones.",
  "problem": "Los estudiantes de primer ingreso no saben a quién pedir ayuda fuera de clase.",
  "beneficiaries": "Estudiantes de primer ingreso de las carreras de software.",
  "members": [
    {
      "userId": "2",
      "fullName": "Donatello Quirós",
      "career": "Ciberseguridad",
      "role": {
        "id": "rol-backend",
        "name": "Desarrollo backend"
      },
      "joinedAt": "2026-09-12T15:00:00.000Z"
    }
  ]
}
```

---

## Ruta 2 · `GET /api/initiatives?category=…&page=…&size=…` · el catálogo filtrado y paginado

**Qué devuelve:** una página del catálogo, `{ items, page, size, totalItems, totalPages }`. Cada item es un `InitiativeItem` (acceso `full`) o un `InitiativeSummary` (acceso `summary`). Un visitante **no ve las privadas** ni las iniciativas en `draft` o `archived`.

**Ejemplo:** `GET /api/initiatives?category=cat-sistemas&page=1&size=9`, la categoría «Sistemas e infraestructura» con el tamaño de página que usa el cliente React. Con los datos de prueba hay tres iniciativas en esa categoría:
- la **5**, restringida, así que sale como `summary`;
- la **6**, pública y formando equipo;
- la **2**, pública y ya convertida en proyecto.

Las tres salen ordenadas de la más nueva a la más vieja.

### Tablas que lee

| Tabla | Para qué | Relación |
|---|---|---|
| `Iniciativas` | Filtrar, contar, ordenar y paginar | — |
| `Categorias` | `category` de cada item | 1 a muchos |
| `Usuarios` | `owner.fullName` | 1 a muchos |
| `Proyectos` | `projectId` (la 2 tiene el proyecto 1) | 1 a 1 |
| `IniciativaMiembros` | Solo contarlos, para `memberCount` y `availableSpots` | muchos a muchos (aquí solo se cuenta) |
| `IniciativaCompetencias` + `Competencias` | `requiredSkills[]` de cada item | **muchos a muchos** |
| `IniciativaEtiquetas` | `tags[]` de cada item | 1 a muchos |

### Consulta SQL

```sql
DECLARE @categoria NVARCHAR(40) = 'cat-sistemas',
        @pagina    INT = 1,
        @tamano    INT = 9;

-- 1) Total de resultados, para totalItems y totalPages (mismo WHERE que la página)
SELECT COUNT(*) AS TotalItems
FROM Iniciativas AS i
WHERE i.Visibilidad <> 'private'                 -- RN-20: el visitante no ve privadas
  AND i.Estado NOT IN ('draft', 'archived')
  AND i.CategoriaId = @categoria;

-- 2) La página: la paginación la hace la base con OFFSET y FETCH
SELECT i.Id, i.Titulo, i.Tipo, i.Resumen, i.Visibilidad, i.Estado, i.IntegrantesEstimados,
       i.CreadoEn, i.ActualizadoEn,
       c.Id AS CategoriaId, c.Nombre AS CategoriaNombre, c.Icono AS CategoriaIcono,
       u.Id AS PropietarioId,
       CONCAT_WS(N' ', u.Nombre, u.PrimerApellido, u.SegundoApellido) AS PropietarioNombre,
       p.Id AS ProyectoId,
       (SELECT COUNT(*) FROM IniciativaMiembros m WHERE m.IniciativaId = i.Id) AS CantidadMiembros
FROM Iniciativas AS i
INNER JOIN Categorias AS c ON c.Id = i.CategoriaId
INNER JOIN Usuarios   AS u ON u.Id = i.PropietarioId
LEFT  JOIN Proyectos  AS p ON p.IniciativaId = i.Id
WHERE i.Visibilidad <> 'private'
  AND i.Estado NOT IN ('draft', 'archived')
  AND i.CategoriaId = @categoria
ORDER BY i.CreadoEn DESC, i.Id                   -- Id desempata: la página es estable
OFFSET (@pagina - 1) * @tamano ROWS
FETCH NEXT @tamano ROWS ONLY;

-- 3) Competencias de las iniciativas de ESA página (muchos a muchos). Los ids salen de la consulta 2
SELECT ic.IniciativaId, co.Id, co.Nombre
FROM IniciativaCompetencias AS ic
INNER JOIN Competencias AS co ON co.Id = ic.CompetenciaId
WHERE ic.IniciativaId IN (5, 6, 2)
ORDER BY ic.IniciativaId, co.Nombre;

-- 4) Etiquetas de las iniciativas de la página
SELECT e.IniciativaId, e.Etiqueta
FROM IniciativaEtiquetas AS e
WHERE e.IniciativaId IN (5, 6, 2)
ORDER BY e.IniciativaId, e.Etiqueta;
```

**Lo que devuelve cada consulta con los datos de prueba:**
1. `TotalItems` = **3**.
2. Tres filas, en este orden:
   - 5 · Mesa de ayuda · restricted · 0 miembros;
   - 6 · Laboratorio en la nube · public · 1 miembro;
   - 2 · Monitoreo · public · `ProyectoId` 1 · 2 miembros.
3. Seis filas: 2 · Análisis de datos, 2 · Desarrollo web (JavaScript y React), 2 · Redes y sistemas operativos, 5 · Análisis de datos, 6 · Cloud y DevOps y 6 · Gestión ágil (Scrum).
4. Seis filas: 2 · monitoreo, 2 · redes, 5 · procesos, 5 · soporte, 6 · cloud y 6 · devops.

### Cómo se arma la respuesta

| Campo del JSON | Sale de |
|---|---|
| `page`, `size` | Los parámetros de la consulta (`@pagina`, `@tamano`) |
| `totalItems` | Consulta 1 → **3** |
| `totalPages` | `CEILING(totalItems / size)`, mínimo 1 → **1** |
| `items[]` | Una por fila de la consulta 2, **en el mismo orden**, con sus listas de las consultas 3 y 4 |
| `accessLevel` de cada item | `public` → `"full"`; `restricted` → `"summary"`. La 5 sale **recortada**: sin `tags`, `status`, `owner`, `memberCount` ni fechas (RN-20) |
| `memberCount`, `availableSpots` | `CantidadMiembros + 1` y `IntegrantesEstimados − memberCount`: 6 → 2 y 4; 2 → 3 y 0 |
| `projectId` | `ProyectoId` como texto: la 2 → `"1"`, la 6 → `null` |

A diferencia del detalle, los items del listado **no** llevan `description`, `problem`, `beneficiaries` ni `members` (eso es un `InitiativeItem`, no un `InitiativeDetail`).

### JSON que respondería

```json
{
  "items": [
    {
      "id": "5",
      "accessLevel": "summary",
      "title": "Reducir el tiempo de atención de la mesa de ayuda",
      "type": "challenge",
      "summary": "Optimizar el proceso de tiquetes de soporte técnico del campus.",
      "category": {
        "id": "cat-sistemas",
        "name": "Sistemas e infraestructura",
        "icon": "bi-hdd-network"
      },
      "requiredSkills": [
        {
          "id": "comp-analisis-datos",
          "name": "Análisis de datos"
        }
      ],
      "visibility": "restricted"
    },
    {
      "id": "6",
      "accessLevel": "full",
      "title": "Laboratorio de práctica en la nube",
      "type": "need",
      "summary": "Un entorno compartido en la nube para practicar DevOps sin costo.",
      "category": {
        "id": "cat-sistemas",
        "name": "Sistemas e infraestructura",
        "icon": "bi-hdd-network"
      },
      "requiredSkills": [
        {
          "id": "comp-cloud",
          "name": "Cloud y DevOps"
        },
        {
          "id": "comp-gestion-agil",
          "name": "Gestión ágil (Scrum)"
        }
      ],
      "visibility": "public",
      "tags": [
        "cloud",
        "devops"
      ],
      "status": "forming",
      "estimatedMembers": 6,
      "memberCount": 2,
      "availableSpots": 4,
      "owner": {
        "id": "2",
        "fullName": "Donatello Quirós"
      },
      "projectId": null,
      "createdAt": "2026-09-05T15:00:00.000Z",
      "updatedAt": "2026-09-13T15:00:00.000Z"
    },
    {
      "id": "2",
      "accessLevel": "full",
      "title": "Monitoreo de la red de los laboratorios",
      "type": "challenge",
      "summary": "Tablero en tiempo real del tráfico y la disponibilidad de la red de los laboratorios.",
      "category": {
        "id": "cat-sistemas",
        "name": "Sistemas e infraestructura",
        "icon": "bi-hdd-network"
      },
      "requiredSkills": [
        {
          "id": "comp-analisis-datos",
          "name": "Análisis de datos"
        },
        {
          "id": "comp-desarrollo-web",
          "name": "Desarrollo web (JavaScript y React)"
        },
        {
          "id": "comp-redes",
          "name": "Redes y sistemas operativos"
        }
      ],
      "visibility": "public",
      "tags": [
        "monitoreo",
        "redes"
      ],
      "status": "project",
      "estimatedMembers": 3,
      "memberCount": 3,
      "availableSpots": 0,
      "owner": {
        "id": "2",
        "fullName": "Donatello Quirós"
      },
      "projectId": "1",
      "createdAt": "2026-08-30T15:00:00.000Z",
      "updatedAt": "2026-09-20T15:00:00.000Z"
    }
  ],
  "page": 1,
  "size": 9,
  "totalItems": 3,
  "totalPages": 1
}
```
