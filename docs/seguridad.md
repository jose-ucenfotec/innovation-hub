# Innovation Hub · Medidas de seguridad

| Medida | Dónde |
|---|---|
| Contraseñas con bcrypt (12 rondas, sal por usuario) | `servidor/src/services/auth.service.js` |
| `passwordHash` con `select: false` y serializadores con campos explícitos | `models/User.js`, `utils/serializadores.js` |
| JWT HS256 con vencimiento de 2 h y `jti` | `auth.service.js` |
| Logout con lista de revocación e índice TTL | `models/RevokedToken.js`, `middleware/autenticacion.js` |
| Comparación contra hash falso cuando el correo no existe | `auth.service.js` |
| CORS solo para `CLIENT_ORIGIN` | `app.js` |
| Encabezados de seguridad con helmet; sin `x-powered-by` | `app.js` |
| Cuerpo JSON limitado a 100 KB | `app.js` |
| Validación a mano de query y body en cada ruta que recibe datos; los datos se copian campo por campo y lo desconocido se descarta | `validators/`, `middleware/validar.js` |
| Errores con formato único, sin trazas ni mensajes de MongoDB | `middleware/manejadorErrores.js` |
| Secretos en `.env`, fuera del repositorio | `.gitignore`, `.env.example` |

## Autorización por punto de acceso

| Punto de acceso | Verificación en el servidor |
|---|---|
| `GET /initiatives` | Filtro de visibilidad en la consulta; privadas solo para propietario o miembros |
| `GET /initiatives/{id}` | `cargarVisible`: 404 privada ajena, 401 institucional sin sesión, proyección `summary` para restringidas |
| `POST /initiatives` | Sesión; `ownerId` tomado del token, nunca del cuerpo |
| `PUT`, `DELETE`, `archive` | `cargarPropia`: 403 si no es el propietario |
| `GET …/members` | Acceso `full` |
| `DELETE …/members/{userId}` | Propietario; no puede retirarse a sí mismo |
| `POST …/requests` | Sesión, visibilidad, reglas en orden fijo, competencia en la intersección |
| `GET /requests/mine` | Filtra por el usuario del token |
| `GET /requests/received` | Solo iniciativas cuyo `ownerId` es el usuario del token |
| `GET`, `PUT /requests/{id}`, `cancel` | Solicitante (y propietario para leer) |
| `POST /requests/{id}/decision` | Propietario de la iniciativa de la solicitud |
| `POST …/project` | Propietario y RN-17/RN-18 |
| `GET /projects`, `/projects/{id}` | Acceso `full` a la iniciativa de origen |
| `GET /users`, `/users/{id}` | Sesión; solo campos públicos |
| `PUT /users/me` | Siempre el usuario del token; el correo no cambia |

## Limitaciones conocidas

- El token se guarda en `sessionStorage`; un XSS podría leerlo. React escapa el contenido y no se usa `dangerouslySetInnerHTML`.
- La aceptación de solicitudes usa actualizaciones condicionales y compensación (ver `modelo-datos.md`). Funciona igual con MongoDB local y con Atlas; en SQL será una transacción.
- No hay límite de intentos de login. La comparación contra un hash falso evita revelar qué correos existen; un límite por IP queda como mejora para la entrega final.
- La búsqueda por texto usa expresiones regulares; con muchos datos convendría un índice de búsqueda dedicado.