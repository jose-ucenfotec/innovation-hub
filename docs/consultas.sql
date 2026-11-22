/* ============================================================================
   Innovation Hub · Consultas SQL sobre el modelo relacional (SQL Server)
   ----------------------------------------------------------------------------
   Tablas y columnas: docs/modelo-datos.md, sección «Tablas».
   Datos de prueba:   docs/modelo-datos.md, «Plan de migración», paso 5.

   Cada resultado esperado supone los datos de prueba en su ESTADO INICIAL,
   como recién cargados. Cada bloque es independiente: si ejecutas el UPDATE o
   el DELETE, vuelve a cargar los datos antes de probar las demás consultas.

   Usuarios:     1 Leonardo · 2 Donatello · 3 Rafael · 4 Miguel
   Iniciativas:  1 Mentorías · 2 Monitoreo · 3 Certificaciones · 4 Galería
                 5 Mesa de ayuda · 6 Laboratorio en la nube
                 7 Gestor de contraseñas · 8 CTF
   ========================================================================== */


/* ----------------------------------------------------------------------------
   1. JOIN 1 a muchos · Las iniciativas con el nombre de su propietario
   Usuarios (1) ──< Iniciativas (muchos), por Iniciativas.PropietarioId.
   CONCAT_WS une las partes y se salta el SegundoApellido cuando es NULL.

   Resultado esperado: 8 filas
     Id | Titulo                                                | Propietario
      1 | Plataforma de mentorías de programación               | Leonardo Brenes Arias
      2 | Monitoreo de la red de los laboratorios               | Donatello Quirós
      3 | Grupos de estudio para certificaciones de seguridad   | Rafael Montero Chaves
      4 | Galería web de proyectos de graduación                | Leonardo Brenes Arias
      5 | Reducir el tiempo de atención de la mesa de ayuda     | Miguel Solano
      6 | Laboratorio de práctica en la nube                    | Donatello Quirós
      7 | Gestor de contraseñas para el grupo de investigación  | Rafael Montero Chaves
      8 | CTF interuniversitario de ciberseguridad              | Miguel Solano
   ---------------------------------------------------------------------------- */
SELECT i.Id,
       i.Titulo,
       CONCAT_WS(N' ', u.Nombre, u.PrimerApellido, u.SegundoApellido) AS Propietario
FROM Iniciativas AS i
INNER JOIN Usuarios AS u ON u.Id = i.PropietarioId
ORDER BY i.Id;


/* ----------------------------------------------------------------------------
   2. JOIN muchos a muchos · Las competencias que requiere cada iniciativa
   Iniciativas >──< Competencias, a través de la tabla intermedia
   IniciativaCompetencias: dos JOIN, uno a cada lado.

   Resultado esperado: 18 filas (3+3+2+2+1+2+2+3)
     1 Mentorías        | Desarrollo web (JavaScript y React), Diseño UX/UI, Gestión ágil (Scrum)
     2 Monitoreo        | Análisis de datos, Desarrollo web (JavaScript y React), Redes y sistemas operativos
     3 Certificaciones  | Ciberseguridad y hacking ético, Gestión ágil (Scrum)
     4 Galería          | Desarrollo web (JavaScript y React), Diseño gráfico y multimedia
     5 Mesa de ayuda    | Análisis de datos
     6 Laboratorio nube | Cloud y DevOps, Gestión ágil (Scrum)
     7 Gestor contraseñ.| Desarrollo web (JavaScript y React), Diseño UX/UI
     8 CTF              | Ciberseguridad y hacking ético, Diseño gráfico y multimedia, Gestión ágil (Scrum)
   ---------------------------------------------------------------------------- */
SELECT i.Id    AS IniciativaId,
       i.Titulo,
       c.Id    AS CompetenciaId,
       c.Nombre AS Competencia
FROM Iniciativas AS i
INNER JOIN IniciativaCompetencias AS ic ON ic.IniciativaId = i.Id
INNER JOIN Competencias           AS c  ON c.Id = ic.CompetenciaId
ORDER BY i.Id, c.Nombre;


/* ----------------------------------------------------------------------------
   2b. JOIN muchos a muchos con datos propios · Quién está en cada equipo y con qué rol
   Iniciativas >──< Usuarios, a través de IniciativaMiembros, que además
   apunta a Roles. El propietario NO aparece: forma parte del equipo sin fila.

   Resultado esperado: 5 filas
     1 | Plataforma de mentorías de programación              | Donatello Quirós       | Desarrollo backend
     2 | Monitoreo de la red de los laboratorios              | Leonardo Brenes Arias  | Desarrollo frontend
     2 | Monitoreo de la red de los laboratorios              | Rafael Montero Chaves  | Análisis de datos
     6 | Laboratorio de práctica en la nube                   | Miguel Solano          | Infraestructura y seguridad
     7 | Gestor de contraseñas para el grupo de investigación | Leonardo Brenes Arias  | Desarrollo frontend
   ---------------------------------------------------------------------------- */
SELECT i.Id AS IniciativaId,
       i.Titulo,
       CONCAT_WS(N' ', u.Nombre, u.PrimerApellido, u.SegundoApellido) AS Miembro,
       r.Nombre AS Rol
FROM IniciativaMiembros AS m
INNER JOIN Iniciativas AS i ON i.Id = m.IniciativaId
INNER JOIN Usuarios    AS u ON u.Id = m.UsuarioId
INNER JOIN Roles       AS r ON r.Id = m.RolId
ORDER BY i.Id, Miembro;


/* ----------------------------------------------------------------------------
   3. Conteo con GROUP BY · Cuántas solicitudes tiene cada iniciativa
   El LEFT JOIN conserva las iniciativas sin solicitudes. Se cuenta s.Id y no *,
   para que esas iniciativas den 0 y no 1.

   Resultado esperado: 8 filas
     Id | Titulo                                                | Solicitudes
      1 | Plataforma de mentorías de programación               | 1   (Rafael, pendiente)
      2 | Monitoreo de la red de los laboratorios               | 2   (Rafael y Leonardo, aceptadas)
      3 | Grupos de estudio para certificaciones de seguridad   | 0
      4 | Galería web de proyectos de graduación                | 0
      5 | Reducir el tiempo de atención de la mesa de ayuda     | 0
      6 | Laboratorio de práctica en la nube                    | 2   (Miguel aceptada, Rafael rechazada)
      7 | Gestor de contraseñas para el grupo de investigación  | 0
      8 | CTF interuniversitario de ciberseguridad              | 0
   ---------------------------------------------------------------------------- */
SELECT i.Id,
       i.Titulo,
       COUNT(s.Id) AS Solicitudes
FROM Iniciativas AS i
LEFT JOIN Solicitudes AS s ON s.IniciativaId = i.Id
GROUP BY i.Id, i.Titulo
ORDER BY i.Id;


/* ----------------------------------------------------------------------------
   3b. Conteo con GROUP BY · Integrantes de cada equipo, con el propietario
   Es el campo memberCount de la API: filas de IniciativaMiembros + 1.

   Resultado esperado: 8 filas
     Id 1 → 2 · Id 2 → 3 · Id 3 → 1 · Id 4 → 1 · Id 5 → 1 · Id 6 → 2 · Id 7 → 2 · Id 8 → 1
   ---------------------------------------------------------------------------- */
SELECT i.Id,
       i.IntegrantesEstimados,
       COUNT(m.UsuarioId) + 1                          AS Integrantes,
       i.IntegrantesEstimados - (COUNT(m.UsuarioId) + 1) AS EspaciosDisponibles
FROM Iniciativas AS i
LEFT JOIN IniciativaMiembros AS m ON m.IniciativaId = i.Id
GROUP BY i.Id, i.IntegrantesEstimados
ORDER BY i.Id;


/* ----------------------------------------------------------------------------
   4. UPDATE con WHERE · Leonardo acepta la solicitud pendiente de Rafael (Id 3)
   aceptar incorpora al equipo. Son dos cambios, así que van en una
   transacción: si el segundo falla, el primero se deshace.

   - El WHERE incluye Estado = 'pending': si la solicitud ya se resolvió, el
     UPDATE afecta 0 filas y se cancela todo (RN-12).
   - El INSERT solo agrega al miembro si todavía hay cupo: 1 miembro + el
     propietario = 2 < 4 integrantes estimados.

   Resultado esperado: el UPDATE afecta 1 fila (Solicitudes 3 pasa a 'accepted'),
   el INSERT agrega 1 fila (Rafael entra a la iniciativa 1 como
   rol-coordinacion), y la consulta 3b daría 3 integrantes para la iniciativa 1.
   Si se ejecuta dos veces, la segunda vez el UPDATE afecta 0 filas.
   ---------------------------------------------------------------------------- */
BEGIN TRANSACTION;

UPDATE Solicitudes
SET Estado             = 'accepted',
    ComentarioDecision = N'Bienvenido al equipo.',
    DecididaEn         = SYSUTCDATETIME(),
    ActualizadoEn      = SYSUTCDATETIME()
WHERE Id = 3
  AND Estado = 'pending';

IF @@ROWCOUNT = 0
BEGIN
    ROLLBACK TRANSACTION;          -- ya no estaba pendiente → 409 NOT_PENDING en la API
END
ELSE
BEGIN
    INSERT INTO IniciativaMiembros (IniciativaId, UsuarioId, RolId)
    SELECT s.IniciativaId, s.UsuarioId, s.RolId
    FROM Solicitudes AS s
    INNER JOIN Iniciativas AS i ON i.Id = s.IniciativaId
    WHERE s.Id = 3
      AND i.Estado IN ('published', 'forming')
      AND (SELECT COUNT(*) FROM IniciativaMiembros WHERE IniciativaId = i.Id) + 1 < i.IntegrantesEstimados;

    IF @@ROWCOUNT = 0
        ROLLBACK TRANSACTION;      -- sin cupo o cerrada → 409 NO_SPOTS / INITIATIVE_CLOSED
    ELSE
    BEGIN
        UPDATE Iniciativas SET Estado = 'forming', ActualizadoEn = SYSUTCDATETIME() WHERE Id = 1;
        COMMIT TRANSACTION;
    END
END;


/* ----------------------------------------------------------------------------
   5. DELETE con WHERE · Leonardo elimina la iniciativa 4 (Galería web)
   no tiene miembros, ni solicitudes, ni proyecto, así que se puede borrar.

   Resultado esperado: 1 fila borrada en Iniciativas. Por ON DELETE CASCADE,
   también se borran 2 filas de IniciativaCompetencias (desarrollo web y
   diseño gráfico) y 2 de IniciativaEtiquetas (portafolio y graduación).
   ---------------------------------------------------------------------------- */
DELETE FROM Iniciativas
WHERE Id = 4;

/* El mismo DELETE con la iniciativa 1 la base lo RECHAZA (error 547, conflicto
   con la llave foránea): Solicitudes.IniciativaId e IniciativaMiembros.IniciativaId
   están en NO ACTION. Así la base misma obliga a archivarla (RN-09).        */
-- DELETE FROM Iniciativas WHERE Id = 1;     -- error 547

/* Archivar es un UPDATE, no un DELETE. Resultado esperado: 1 fila actualizada. */
UPDATE Iniciativas
SET Estado = 'archived', ActualizadoEn = SYSUTCDATETIME()
WHERE Id = 1
  AND PropietarioId = 1;           -- solo el propietario (Leonardo)


/* ----------------------------------------------------------------------------
   6. INSERT que la base RECHAZA · Una segunda solicitud pendiente de Rafael
   para la iniciativa 1.
   Rafael (3) ya tiene la solicitud 3 en 'pending' para la iniciativa 1. El
   índice único filtrado (IniciativaId, UsuarioId) WHERE Estado = 'pending'
   no permite una segunda. Estado no se envía: toma su DEFAULT 'pending'.

   Resultado esperado: error 2601 «Cannot insert duplicate key row… with
   unique index…». No se inserta nada.
   ---------------------------------------------------------------------------- */
INSERT INTO Solicitudes (IniciativaId, UsuarioId, Mensaje, CompetenciaOfrecidaId, RolId, Disponibilidad)
VALUES (1, 3, N'Quiero coordinar los sprints del equipo.', 'comp-gestion-agil', 'rol-coordinacion', N'3 h/semana');


/* Otros INSERT que la base rechaza, cada uno por una llave o restricción distinta: */

-- 6b. UNIQUE de Usuarios.Correo → error 2627. El correo ya es de Leonardo.
INSERT INTO Usuarios (Nombre, PrimerApellido, Correo, ContrasenaHash, TipoMiembro, Carrera)
VALUES (N'Otra', N'Persona', N'leonardo.brenes@ucenfotec.ac.cr', N'$2b$10$hash', 'student', N'Diseño');

-- 6c. CHECK de Iniciativas.Tipo → error 547. 'proyecto' no es idea, need ni challenge.
INSERT INTO Iniciativas (Titulo, Tipo, Resumen, Descripcion, Problema, Beneficiarios,
                         CategoriaId, IntegrantesEstimados, Visibilidad, PropietarioId)
VALUES (N'Club de algoritmos', 'proyecto', N'Practicar programación competitiva.',
        N'Sesiones semanales con problemas y revisión en grupo.', N'No hay espacio para practicar.',
        N'Estudiantes de software.', 'cat-educacion', 4, 'public', 1);

-- 6d. UNIQUE de Proyectos.IniciativaId → error 2627. La iniciativa 2 ya tiene el proyecto 1.
INSERT INTO Proyectos (IniciativaId, Nombre, Objetivo, Descripcion, FechaInicio)
VALUES (2, N'Monitoreo, segunda versión', N'Repetir el proyecto de monitoreo.',
        N'Intento de crear un segundo proyecto para la misma iniciativa.', '2026-12-01');

-- 6e. PRIMARY KEY de IniciativaMiembros → error 2627. Leonardo ya está en el equipo de la 2.
INSERT INTO IniciativaMiembros (IniciativaId, UsuarioId, RolId)
VALUES (2, 1, 'rol-frontend');

-- 6f. FOREIGN KEY de Solicitudes.IniciativaId → error 547. No existe la iniciativa 99.
INSERT INTO Solicitudes (IniciativaId, UsuarioId, Mensaje, CompetenciaOfrecidaId, RolId, Disponibilidad)
VALUES (99, 3, N'Solicitud a una iniciativa que no existe.', 'comp-gestion-agil', 'rol-coordinacion', N'3 h/semana');


/* ----------------------------------------------------------------------------
   7. Visibilidad y paginación · El catálogo que ve un visitante
   Es la consulta de la ruta 2 de docs/rutas.md: sin privadas, sin borradores
   ni archivadas, 9 por página, de la más nueva a la más vieja.

   Resultado esperado: 7 filas (todas menos la 7, que es privada), en este
   orden: 8, 4, 5, 3, 1, 6, 2.
   ---------------------------------------------------------------------------- */
SELECT i.Id, i.Titulo, i.Visibilidad, i.CreadoEn
FROM Iniciativas AS i
WHERE i.Visibilidad <> 'private'
  AND i.Estado NOT IN ('draft', 'archived')
ORDER BY i.CreadoEn DESC, i.Id
OFFSET 0 ROWS FETCH NEXT 9 ROWS ONLY;
