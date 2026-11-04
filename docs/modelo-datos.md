# Innovation Hub · Modelo de datos en MongoDB

Base: `innovation_hub`. Las colecciones de dominio usan `_id` ObjectId; los catálogos usan `_id` de texto.

## Colecciones

| Colección | Campos principales |
|---|---|
| `categories` | `_id` (string), `name`, `icon` |
| `skills` | `_id` (string), `name`, `area` |
| `roles` | `_id` (string), `name` |
| `users` | `firstName`, `lastName`, `secondLastName`, `email` (único), `passwordHash` (`select: false`), `memberType`, `career`, `bio`, `skills[] { skillId → skills, level }`, `interests[]`, `availability { hoursPerWeek, detail }`, `portfolioUrl`, `status`, `acceptedTermsAt`, `createdAt`, `updatedAt` |
| `initiatives` | `title`, `type`, `summary`, `description`, `problem`, `beneficiaries`, `categoryId → categories`, `requiredSkillIds[] → skills`, `estimatedMembers`, `visibility`, `tags[]`, `ownerId → users`, `members[] { userId → users, roleId → roles, joinedAt }`, `status`, `createdAt`, `updatedAt` |
| `requests` | `initiativeId → initiatives`, `userId → users`, `message`, `offeredSkillId → skills`, `roleId → roles`, `availability`, `status`, `decisionComment`, `decidedAt`, `createdAt`, `updatedAt` |
| `projects` | `initiativeId → initiatives` (único), `name`, `objective`, `description`, `technologies[]`, `startDate`, `estimatedEndDate`, `repositoryUrl`, `status`, `createdAt`, `updatedAt` |
| `revokedtokens` | `jti` (único), `expiresAt` (índice TTL) |

## Decisiones de embebido o referencia

| Relación | Decisión | Por qué | En SQL (diciembre) |
|---|---|---|---|
| Usuario → competencias | **Embebido** `{ skillId, level }` con **referencia** al catálogo | Pocas por usuario, siempre se leen y editan con el perfil; el nombre vive en el catálogo para no duplicarlo | `UserSkills(UserId, SkillId, Level)` |
| Iniciativa → competencias requeridas | **Arreglo de referencias** | Relación muchos a muchos con un catálogo estable; se filtra por `requiredSkillIds` | `InitiativeSkills(InitiativeId, SkillId)` |
| Iniciativa → etiquetas | **Embebido** como textos | No tienen identidad propia ni se consultan aparte | `InitiativeTags(InitiativeId, Tag)` |
| Iniciativa → propietario | **Referencia** `ownerId` | El usuario existe por sí mismo y cambia su perfil | FK `OwnerId` |
| Iniciativa → equipo | **Embebido** `members[]` | Acotado (máximo 20), siempre se muestra con la iniciativa, y agregar un miembro con control de cupo es una sola actualización atómica del documento | `InitiativeMembers(InitiativeId, UserId, RoleId, JoinedAt)` |
| Solicitudes | **Colección propia con referencias** | Crece sin límite, se consulta por solicitante y por propietario con filtros y paginación, y tiene ciclo de vida propio | `Requests` con FK a iniciativa, usuario, competencia y rol |
| Proyecto → iniciativa | **Colección propia**, `initiativeId` único | Relación 1 a 1 (RN-18) con estado y datos propios; la iniciativa se conserva (RN-19) | `Projects` con FK única |
| Logout | **Colección `revokedtokens`** con TTL | MongoDB borra solo las entradas vencidas | Tabla con limpieza programada o caché |

Lo único que se repite es el nombre de la persona en las respuestas: no se guarda copiado, se resuelve al serializar.

## Índices

| Colección | Índice | Para qué |
|---|---|---|
| `users` | `{ email: 1 }` único | RN-01 |
| `initiatives` | `{ status: 1, type: 1, categoryId: 1 }` | filtros del catálogo |
| `initiatives` | `{ ownerId: 1 }`, `{ 'members.userId': 1 }`, `{ requiredSkillIds: 1 }` | "mis iniciativas", "participo en", filtro por competencia |
| `requests` | `{ initiativeId: 1, userId: 1 }` único parcial donde `status = 'pending'` | RN-11 garantizada por la base |
| `requests` | `{ userId: 1, createdAt: -1 }` | mis solicitudes |
| `projects` | `{ initiativeId: 1 }` único | RN-18 |
| `revokedtokens` | `{ expiresAt: 1 }` con `expireAfterSeconds: 0` | limpieza automática |

La búsqueda por texto usa expresiones regulares sin distinguir mayúsculas sobre título, resumen y
etiquetas, para coincidir con fragmentos de palabras (el índice de texto de MongoDB solo encuentra
palabras completas).

## Atomicidad

MongoDB instalado como servicio en Windows es un servidor único y no admite transacciones con varios
documentos. Aceptar una solicitud toca dos documentos y se resuelve así:

1. `requests.updateOne({ _id, status: 'pending' }, { status: 'accepted', … })`: si no modifica nada, la solicitud ya no estaba pendiente → 409.
2. `initiatives.updateOne({ _id, status ∈ [published, forming], 'members.userId' ≠ usuario, cupo disponible }, { $push: members, status: 'forming' })`.
3. Si el paso 2 no modifica nada, se revierte el paso 1 y se responde 409.

En SQL este flujo será una transacción.