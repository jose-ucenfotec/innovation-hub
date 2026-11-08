# Innovation Hub · Contrato de la API

Versión 1.0 · congelado en la etiqueta `entrega-2`. Lo implementan el servidor Node.js + Express
(Avance 2) y el servidor ASP.NET Core (entrega final) sin diferencias en rutas, verbos, cuerpos,
respuestas ni códigos de estado.

## 1. Convenciones

| Tema | Regla |
|---|---|
| Base | `http://<host>:<puerto>/api`. El cliente la lee de `VITE_API_URL`. |
| Formato | JSON UTF-8. `Content-Type: application/json` en peticiones con cuerpo. |
| Nombres | camelCase en inglés. |
| Identificadores | `id` es un string opaco. El cliente no asume su forma (ObjectId en MongoDB, GUID en SQL). Los catálogos usan códigos legibles (`cat-tecnologia`). |
| Fechas | Fecha y hora: ISO 8601 UTC (`2026-09-08T15:00:00.000Z`). Solo fecha: `YYYY-MM-DD` (`startDate`, `estimatedEndDate`). |
| Autenticación | `Authorization: Bearer <token>`. El token se obtiene en `POST /auth/login`. |
| Campos nulos | Los opcionales sin valor se envían como `null`, nunca se omiten en las respuestas. |
| Datos sensibles | Ninguna respuesta incluye contraseñas, hashes, tokens ajenos, cadenas de conexión ni trazas. |

### 1.1 Valores controlados

| Campo | Valores |
|---|---|
| `type` | `idea`, `need`, `challenge` |
| `visibility` | `public`, `institutional`, `restricted`, `private` |
| `status` (iniciativa) | `draft`, `published`, `forming`, `project`, `archived` |
| `status` (solicitud) | `pending`, `accepted`, `rejected`, `cancelled` |
| `status` (proyecto) | `planning`, `in_progress`, `paused`, `finished`, `archived` |
| `level` | `basic`, `intermediate`, `advanced` |
| `memberType` | `student`, `teacher`, `staff` |
| `accessLevel` | `full`, `summary` |

### 1.2 Paginación y orden

Todo listado acepta `page` (entero ≥ 1, por defecto 1) y `size` (entero ≥ 1, por defecto 12; valores
mayores a 50 se limitan a 50). Una página fuera de rango devuelve `items` vacío.

```json
{ "items": [], "page": 1, "size": 12, "totalItems": 37, "totalPages": 4 }
```

`sort` recibe un campo de la lista blanca de cada recurso; con `-` delante es descendente. Un valor
fuera de la lista se ignora y se usa el orden por defecto.

### 1.3 Errores

Formato único en toda la API:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Hay datos inválidos.",
    "details": [ { "field": "title", "message": "Debe tener al menos 5 caracteres." } ]
  }
}
```

`details` es un arreglo (vacío si no aplica). `field` usa el mismo nombre del cuerpo o del parámetro.

| Código HTTP | `code` | Cuándo |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Forma, tipo, longitud, rango, formato, selección inválida o regla entre campos |
| 401 | `UNAUTHORIZED` | Falta el token, es inválido, venció o fue revocado; o la iniciativa es institucional y no hay sesión |
| 401 | `INVALID_CREDENTIALS` | Correo o contraseña incorrectos en el login |
| 403 | `FORBIDDEN` | Hay sesión pero no hay permiso sobre el recurso |
| 404 | `NOT_FOUND` | El recurso o la ruta no existen, o es privado y el usuario no es propietario ni miembro |
| 409 | ver 1.4 | El estado actual impide la operación |
| 500 | `INTERNAL_ERROR` | Error inesperado; mensaje genérico, sin detalles internos |

### 1.4 Conflictos (409)

| `code` | Significado |
|---|---|
| `EMAIL_TAKEN` | El correo ya está registrado (RN-01) |
| `ARCHIVED` | La iniciativa está archivada |
| `PARTICIPANTS_BELOW_TEAM` | `estimatedMembers` menor que el equipo actual incluido el propietario |
| `HAS_RELATED_DATA` | Tiene equipo, solicitudes o proyecto: debe archivarse (RN-08, RN-09) |
| `SELF_REQUEST` | El propietario no puede solicitar en su iniciativa (RN-10) |
| `ALREADY_MEMBER` | Ya es miembro del equipo (RN-15) |
| `INITIATIVE_CLOSED` | La iniciativa no está en `published` ni `forming` |
| `NO_SPOTS` | No quedan espacios |
| `DUPLICATE_PENDING` | Ya existe una solicitud pendiente del mismo usuario (RN-11) |
| `NOT_PENDING` | La solicitud ya no está pendiente (RN-12, RN-13) |
| `CANNOT_REMOVE_OWNER` | El propietario no puede retirarse del equipo |
| `NO_MEMBERS` | Conversión sin integrantes además del propietario (RN-17) |
| `ALREADY_PROJECT` | La iniciativa ya generó un proyecto (RN-18) |

Al crear una solicitud las reglas se evalúan siempre en este orden y se devuelve la primera que falle:
`SELF_REQUEST` → `ALREADY_MEMBER` → `INITIATIVE_CLOSED` → `NO_SPOTS` → `DUPLICATE_PENDING` → validación del cuerpo.

## 2. Visibilidad (RN-20)

| `visibility` | Visitante | Usuario autenticado | Propietario o miembro |
|---|---|---|---|
| `public` | `full` | `full` | `full` |
| `institutional` | listado `summary`; detalle 401 | `full` | `full` |
| `restricted` | `summary` | `summary` | `full` |
| `private` | no aparece; detalle 404 | no aparece; detalle 404 | `full` |

Una respuesta `summary` contiene **solo** `id`, `accessLevel`, `title`, `type`, `summary`, `category`,
`requiredSkills` y `visibility` (documento general, nivel Restringida). El listado general excluye
`draft` y `archived` salvo que se filtre por `status` o se pida `owner=me` / `member=me`.

## 3. Representaciones

```jsonc
// Category
{ "id": "cat-tecnologia", "name": "Tecnología", "icon": "bi-cpu" }
// Skill
{ "id": "comp-javascript", "name": "JavaScript", "area": "Desarrollo" }
// Role
{ "id": "rol-frontend", "name": "Desarrollo frontend" }

// UserPublic
{ "id": "…", "firstName": "Ana", "lastName": "Mora", "secondLastName": "Jiménez", "fullName": "Ana Mora Jiménez",
  "memberType": "student", "career": "Ingeniería de Software", "bio": "…",
  "skills": [ { "skillId": "comp-javascript", "name": "JavaScript", "level": "advanced" } ],
  "interests": ["comunidad"], "availability": { "hoursPerWeek": 6, "detail": "tardes" },
  "portfolioUrl": "https://github.com/anamora" }
// UserMe = UserPublic + { "email", "status": "active", "createdAt", "updatedAt" }

// InitiativeSummary (accessLevel "summary")
{ "id": "…", "accessLevel": "summary", "title": "…", "type": "challenge", "summary": "…",
  "category": { "id": "cat-tecnologia", "name": "Tecnología", "icon": "bi-cpu" },
  "requiredSkills": [ { "id": "comp-analisis-datos", "name": "Análisis de datos" } ], "visibility": "restricted" }

// InitiativeItem (accessLevel "full", en listados)
InitiativeSummary + { "tags": [], "status": "published", "estimatedMembers": 4, "memberCount": 2,
  "availableSpots": 2, "owner": { "id": "…", "fullName": "…" }, "projectId": null, "createdAt": "…", "updatedAt": "…",
  "relations": { "members": 1, "requests": 1, "hasProject": false } }   // relations solo para el propietario

// InitiativeDetail (GET /initiatives/{id} con accessLevel "full")
InitiativeItem + { "description": "…", "problem": "…", "beneficiaries": "…",
  "members": [ { "userId": "…", "fullName": "…", "career": "…", "role": { "id": "rol-backend", "name": "…" }, "joinedAt": "…" } ] }

// Request
{ "id": "…", "initiative": { "id": "…", "title": "…" },
  "applicant": { "id": "…", "fullName": "…", "career": "…", "skills": [ /* como UserPublic.skills */ ] },
  "message": "…", "offeredSkill": { "id": "…", "name": "…" }, "role": { "id": "…", "name": "…" },
  "availability": "4 h/semana", "status": "pending",
  "decision": null /* o { "comment": "…" | null, "decidedAt": "…" } */, "createdAt": "…", "updatedAt": "…" }

// Project (listado); ProjectDetail agrega "members" igual que InitiativeDetail
{ "id": "…", "initiative": { "id": "…", "title": "…" }, "name": "…", "objective": "…", "description": "…",
  "technologies": ["Node.js"], "startDate": "2026-09-20", "estimatedEndDate": "2026-12-15" /* o null */,
  "status": "planning", "repositoryUrl": "https://github.com/…" /* o null */,
  "owner": { "id": "…", "fullName": "…" }, "memberCount": 3, "createdAt": "…", "updatedAt": "…" }
```

## 4. Validación de entrada

| Campo | Regla |
|---|---|
| `title` | texto 5–80 |
| `summary` | texto 10–160 |
| `description` | texto 20–2000 |
| `problem` | texto 10–1000 |
| `beneficiaries` | texto 5–500 |
| `categoryId` | id existente en categorías |
| `requiredSkillIds` | 1–8 ids existentes, sin repetir |
| `estimatedMembers` | entero 1–20 |
| `visibility`, `type` | valores de 1.1 |
| `tags` | 0–5, cada una `^[\p{L}\p{N}][\p{L}\p{N}\- ]{1,29}$`, sin repetir |
| `message` | texto 15–300 |
| `offeredSkillId` | requerida por la iniciativa **y** presente en el perfil del solicitante |
| `roleId` | id existente en roles |
| `availability` | `^\d{1,2}\s?h\/semana$` |
| `name` (proyecto) | texto 5–80 |
| `objective` | texto 10–300 |
| `technologies` | 0–10 textos de 1–40 |
| `startDate` | `YYYY-MM-DD` |
| `estimatedEndDate` | `YYYY-MM-DD` o null, ≥ `startDate` |
| `repositoryUrl` | null o `^https://github\.com/[\w.-]+/[\w.-]+/?$` |
| `email` | formato de correo, máx. 120 |
| `password` | 8–72, al menos una letra y un número |
| `confirmPassword` | igual a `password` |
| `firstName`, `lastName`, `career` | texto 2–60; `secondLastName` opcional 2–60 |
| `bio` | 0–500 |
| `skills` (perfil) | 0–15 `{ skillId existente, level }`, sin repetir `skillId` |
| `interests` | 0–10 textos 2–30 |
| `availability` (perfil) | `{ hoursPerWeek: entero 0–40, detail: texto 0–100 }` |
| `portfolioUrl` | null o URL http(s) máx. 200 |

Los textos se recortan (trim) antes de validar. Campos desconocidos se ignoran.

## 5. Endpoints

Acceso: **público** (sin token), **opcional** (con o sin token; cambia la respuesta), **auth** (token obligatorio).

### 5.1 Autenticación

| Verbo y ruta | Acceso | Cuerpo | Éxito | Errores |
|---|---|---|---|---|
| `POST /auth/register` | público | `{ firstName, lastName, secondLastName?, email, password, confirmPassword, memberType, career, acceptTerms: true }` | 201 `UserMe` + `Location: /api/users/{id}` | 400, 409 `EMAIL_TAKEN` |
| `POST /auth/login` | público | `{ email, password }` | 200 `{ token, tokenType: "Bearer", expiresAt, user: UserMe }` | 400, 401 `INVALID_CREDENTIALS` |
| `POST /auth/logout` | auth | — | 204; el token queda revocado | 401 |
| `GET /auth/me` | auth | — | 200 `UserMe` | 401 |

### 5.2 Usuarios

| Verbo y ruta | Acceso | Parámetros o cuerpo | Éxito | Errores |
|---|---|---|---|---|
| `GET /users` | auth | `q` (nombre), `skill`, `career`, `available=true`, `page`, `size`, `sort` ∈ firstName, lastName, createdAt | 200 página de `UserPublic` | 400, 401 |
| `GET /users/{id}` | auth | — | 200 `UserPublic` | 401, 404 |
| `PUT /users/me` | auth | `{ firstName, lastName, secondLastName, career, bio, skills, interests, availability, portfolioUrl }`; `email` no editable | 200 `UserMe` | 400 (también si `email` viene distinto), 401 |

### 5.3 Catálogos

| Verbo y ruta | Acceso | Éxito |
|---|---|---|
| `GET /categories` | público | 200 `Category[]` |
| `GET /skills` | público | 200 `Skill[]` |
| `GET /roles` | público | 200 `Role[]` |

### 5.4 Iniciativas

| Verbo y ruta | Acceso | Parámetros o cuerpo | Éxito | Errores |
|---|---|---|---|---|
| `GET /initiatives` | opcional | `q` (título, resumen, etiquetas), `type`, `category`, `skill`, `status`, `hasSpots=true`, `owner` (id o `me`), `member=me`, `page`, `size`, `sort` ∈ createdAt, updatedAt, title (defecto `-createdAt`) | 200 página de `InitiativeSummary` o `InitiativeItem` según 2 | 400; 401 si usa `me` sin token |
| `GET /initiatives/{id}` | opcional | — | 200 `InitiativeDetail` o `InitiativeSummary` | 401 (institucional sin sesión), 404 |
| `POST /initiatives` | auth | `{ title, type, summary, description, problem, beneficiaries, categoryId, requiredSkillIds, estimatedMembers, visibility, tags }` | 201 `InitiativeDetail` (`status: "published"`) + `Location` | 400, 401 |
| `PUT /initiatives/{id}` | propietario | mismo cuerpo que POST, completo | 200 `InitiativeDetail` | 400, 401, 403, 404, 409 `ARCHIVED` / `PARTICIPANTS_BELOW_TEAM` |
| `DELETE /initiatives/{id}` | propietario | — | 204 | 401, 403, 404, 409 `HAS_RELATED_DATA` |
| `POST /initiatives/{id}/archive` | propietario | — | 200 `InitiativeDetail` | 401, 403, 404, 409 `ARCHIVED` |

### 5.5 Equipo

| Verbo y ruta | Acceso | Parámetros | Éxito | Errores |
|---|---|---|---|---|
| `GET /initiatives/{id}/members` | acceso `full` | `skill`, `role` | 200 `Member[]` | 401, 403 (acceso `summary`), 404 |
| `DELETE /initiatives/{id}/members/{userId}` | propietario | — | 204 | 401, 403, 404, 409 `CANNOT_REMOVE_OWNER` |

### 5.6 Solicitudes

| Verbo y ruta | Acceso | Parámetros o cuerpo | Éxito | Errores |
|---|---|---|---|---|
| `POST /initiatives/{id}/requests` | auth | `{ message, offeredSkillId, roleId, availability }` | 201 `Request` (`pending`) + `Location` | 400, 401, 404, 409 (orden de 1.4) |
| `GET /requests/mine` | auth | `status`, `page`, `size`, `sort` ∈ createdAt, updatedAt | 200 página de `Request` | 400, 401 |
| `GET /requests/received` | auth | `initiativeId`, `status`, `skill`, `role`, `from`, `to` (`YYYY-MM-DD`), `page`, `size`, `sort` | 200 página de `Request` de iniciativas propias | 400, 401 |
| `GET /requests/{id}` | solicitante o propietario | — | 200 `Request` | 401, 403, 404 |
| `PUT /requests/{id}` | solicitante | `{ message, offeredSkillId, roleId, availability }` | 200 `Request` | 400, 401, 403, 404, 409 `NOT_PENDING` |
| `POST /requests/{id}/cancel` | solicitante | — | 200 `Request` (`cancelled`) | 401, 403, 404, 409 `NOT_PENDING` |
| `POST /requests/{id}/decision` | propietario de la iniciativa | `{ decision: "accepted" \| "rejected", comment?: texto 0–300 }` | 200 `Request`; si `accepted`, el solicitante queda en `members` y la iniciativa pasa a `forming` (RN-14) | 400, 401, 403, 404, 409 `NOT_PENDING` / `INITIATIVE_CLOSED` / `NO_SPOTS` |

### 5.7 Proyectos

| Verbo y ruta | Acceso | Parámetros o cuerpo | Éxito | Errores |
|---|---|---|---|---|
| `POST /initiatives/{id}/project` | propietario | `{ name, objective, description, technologies, startDate, estimatedEndDate, repositoryUrl }` | 201 `ProjectDetail` (`planning`); la iniciativa pasa a `project` + `Location` | 400, 401, 403, 404, 409 `NO_MEMBERS` / `ALREADY_PROJECT` / `ARCHIVED` |
| `GET /projects` | auth | `status`, `page`, `size`, `sort` ∈ createdAt, name, startDate | 200 página de `Project` cuyo origen el usuario ve con acceso `full` | 400, 401 |
| `GET /projects/{id}` | auth, acceso `full` al origen | — | 200 `ProjectDetail` | 401, 404 |

## 6. Ejemplo completo

```http
POST /api/initiatives/660000000000000000000006/requests
Authorization: Bearer eyJhbGciOi…
Content-Type: application/json

{ "message": "Puedo coordinar las actividades del espacio.", "offeredSkillId": "comp-gestion",
  "roleId": "rol-coordinacion", "availability": "3 h/semana" }
```

```http
HTTP/1.1 201 Created
Location: /api/requests/6720f1c2a9b3e4d5f6a7b8c9
Content-Type: application/json

{ "id": "6720f1c2a9b3e4d5f6a7b8c9", "initiative": { "id": "660000000000000000000006", "title": "Espacio de coworking para emprendedores" },
  "applicant": { "id": "650000000000000000000003", "fullName": "María Solís Rojas", "career": "Agronomía", "skills": [ … ] },
  "message": "Puedo coordinar las actividades del espacio.", "offeredSkill": { "id": "comp-gestion", "name": "Gestión de proyectos" },
  "role": { "id": "rol-coordinacion", "name": "Coordinación" }, "availability": "3 h/semana", "status": "pending",
  "decision": null, "createdAt": "2026-11-02T18:00:00.000Z", "updatedAt": "2026-11-02T18:00:00.000Z" }
```

## 7. Decisiones pensadas para la reimplementación en .NET

- `DELETE` nunca archiva en silencio: responde 409 y el cliente llama a `/archive`. Un verbo, un efecto.
- Privadas responden 404 a terceros para no revelar que existen.
- Las acciones de estado (`archive`, `cancel`, `decision`, `project`) son subrecursos `POST`, que se mapean igual en controladores de ASP.NET Core.
- Los catálogos usan códigos de texto como clave, válidos tanto en MongoDB como en una columna `varchar` con clave primaria.
- Token Bearer en encabezado: ASP.NET Core lo valida con `JwtBearer` sin cambiar el cliente.