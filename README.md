# Innovation Hub

Proyecto del curso SOFT-12 — Programación web avanzada · Universidad CENFOTEC

**Estudiante:** Jose Ricardo Barrantes Sáenz · **Sección:** SCV2 · **Periodo:** III cuatrimestre 2026
**Docente:** Álvaro Cordero Peña

## Descripción

Aplicación web para publicar ideas, necesidades y retos, declarar las competencias que cada iniciativa
requiere, solicitar participación, conformar equipos interdisciplinarios y convertir iniciativas en
proyectos con su repositorio de GitHub.

| Avance | Tecnología | Carpeta |
|---|---|---|
| 1 — Prototipo | HTML, Sass + Bootstrap, JavaScript, JSON | `avance1/` |
| 2 — Cliente-servidor | React (Vite) + Node.js/Express + MongoDB | `cliente/`, `servidor/` |
| Final | React + ASP.NET Core + EF Core | pendiente |

## Arquitectura

```
cliente/ (React + Vite)  ──HTTP/JSON──▶  servidor/ (Express)  ──Mongoose──▶  MongoDB
                         ──HTTPS──────▶  API pública de GitHub
```

El cliente nunca accede a la base de datos. Toda regla de negocio, permiso y validación definitiva
ocurre en el servidor.

## Estructura

```
innovation-hub/
├── docs/            api-contract.md · modelo-datos.md · seguridad.md
├── avance1/         prototipo del Avance 1 (sin cambios)
├── cliente/         src/api · components · context · features · hooks · styles · utils
├── servidor/        src/config · controllers · db · middleware · models · repositories · routes · seed · services · utils · validators
└── pruebas/         colección y entorno de Postman + generador
```

## Requisitos (Windows)

- Node.js 20.6 o superior (los scripts cargan el `.env` con `--env-file`).
- MongoDB: Community Server 8 instalado como servicio (con mongosh) **o** un clúster gratuito de MongoDB Atlas.
- Git.

## Puesta en marcha

### 1. Base de datos

Verificar que el servicio esté activo:

```powershell
Get-Service MongoDB
mongosh "mongodb://127.0.0.1:27017" --eval "db.runCommand({ ping: 1 })"
```

Si está detenido: `Start-Service MongoDB` (PowerShell como administrador).

**Con MongoDB Atlas:** crear un usuario de base de datos, agregar tu IP en *Network Access* y copiar
la cadena de *Connect → Drivers*. En `servidor/.env` va con el nombre de la base antes del `?`:

```
MONGODB_URI=mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/innovation_hub?retryWrites=true&w=majority
```

### 2. Servidor

```powershell
cd servidor
npm install
Copy-Item .env.example .env
```

Editar `servidor/.env`:

| Variable | Valor |
|---|---|
| `PORT` | `3000` |
| `NODE_ENV` | `development` |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/innovation_hub` o la cadena de Atlas |
| `CLIENT_ORIGIN` | `http://localhost:5173` |
| `JWT_SECRET` | cadena aleatoria: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | `2h` |
| `BCRYPT_ROUNDS` | `12` |

```powershell
npm run seed     # borra y carga los datos de prueba
npm run dev      # http://localhost:3000/api
```

### 3. Cliente

En otra terminal:

```powershell
cd cliente
npm install
Copy-Item .env.example .env   # VITE_API_URL y VITE_GITHUB_API_URL
npm run dev                   # http://localhost:5173
```

### Usuarios de prueba

Contraseña de todos: `Prueba123!` (definida en `servidor/src/seed/seed.js`).

| Usuario | Correo | Para probar |
|---|---|---|
| Leonardo Brenes | leonardo.brenes@ucenfotec.ac.cr | propietario con equipo; miembro de una privada |
| Donatello Quirós | donatello.quiros@ucenfotec.ac.cr | propietario que recibe solicitudes |
| Rafael Montero | rafael.montero@ucenfotec.ac.cr | solicitante; propietario de una privada |
| Miguel Solano | miguel.solano@ucenfotec.ac.cr | propietario de una restringida |

### 4. Pruebas de la API

Con el servidor en marcha:

```powershell
cd servidor
npm run test:api   # recarga el seed y ejecuta la colección con Newman
```

Para abrirla en Postman: Import → `pruebas/innovation-hub.postman_collection.json` y
`pruebas/innovation-hub.postman_environment.json`. Si se modifica, regenerarla con
`node pruebas/generar-coleccion.mjs`.

### Avance 1

Abrir la raíz del repositorio en VS Code → clic derecho sobre `avance1/index.html` →
**Open with Live Server** → `http://127.0.0.1:5500/avance1/index.html`.
Para recompilar sus estilos: `cd avance1`, `npm install` y `npm run css`.

## Documentación

- [Contrato de la API](docs/api-contract.md) — congelado desde la etiqueta `entrega-2`.
- [Modelo de datos](docs/modelo-datos.md) — embebido frente a referencia y equivalencia en SQL.
- [Seguridad](docs/seguridad.md) — medidas y autorización por punto de acceso.

## Decisiones de diseño del Avance 2

1. **Conversión primero.** El Avance 1 se migró a React contra un servidor simulado con el mismo
   contrato; luego se reemplazó por Express cambiando una variable, sin rehacer pantallas.
2. **Capas en el servidor.** Rutas → controladores → servicios → repositorios. Las reglas de negocio
   son funciones puras en `services/reglas.js`.
3. **Contrato pensado para .NET.** Recursos en inglés, enums en minúscula, ids opacos, errores con
   formato único, acciones de estado como subrecursos `POST`.
4. **Visibilidad en el servidor.** Las restringidas ajenas salen con proyección `summary`; las privadas
   ajenas responden 404.
5. **Equipo embebido, solicitudes referenciadas.** Ver `docs/modelo-datos.md`.
6. **JWT con revocación.** Cerrar sesión invalida el token aunque no haya vencido.
7. **Correcciones del Avance 1.** RN-03 estricta, visibilidad sin valor por defecto, contadores en todos
   los campos con límite, errores que se limpian al corregir, etiquetas y competencias como chips,
   eliminar desde la lista, competencias de la solicitud en intersección y roles de catálogo.
8. **Patrones de las prácticas de clase.** La validación del servidor está escrita a mano: cada función
   devuelve un mensaje por campo y copia solo los campos permitidos. El `.env` se carga con `--env-file`.

## Resumen de commits

<!-- INICIO TABLA COMMITS -->
| # | Fecha | Hash | Mensaje | Sección del sistema | Cambio principal |
|---|-------|------|---------|---------------------|------------------|
| 1 | 2026-09-14 | 9726a0b | Crear estructura del avance 1 y documentacion inicial | Documentación | Estructura inicial del proyecto y README base |
| 2 | 2026-09-14 | f9593e9 | Automatizar la tabla de commits del README | Documentación | Script para generar automáticamente la tabla de commits |
| 3 | 2026-09-14 | f75aa83 | Marcar los scripts como ejecutables | Scripts | Permisos de ejecución en los scripts del repositorio |
| 4 | 2026-09-14 | 4ed592b | Actualizar tabla de commits | Documentación | Sincronizar tabla de commits con el historial actual |
| 5 | 2026-09-15 | 4526bff | Creacion de HTML base semantico y la seccion catalogo de manera estructurada | HTML / Catálogo | Estructura semántica base y sección catálogo |
| 6 | 2026-09-18 | 308f2ee | Modificar index.html con base en uso de bootstrap | HTML / Index | Adaptar index.html a clases de Bootstrap |
| 7 | 2026-09-24 | e045ca8 | Creacion de JSON para los key-value pair de esta primer entrega, con base en las necesidades de la pagina. Ajustes en index para reflejar el JS que los llamara | Datos / JSON | Archivos JSON de datos y ajustes en index para consumirlos vía JS |
| 8 | 2026-09-24 | 0a6e481 | Creacion de esqueleto para pagina catalogo. Con base en los JS mapeados necesarios de momento | Catálogo | Esqueleto HTML de la página catálogo |
| 9 | 2026-09-24 | 9cea2c6 | Creacion de esqueleto para pagina detalle. Con base en los JS mapeados necesarios de momento | Detalle | Esqueleto HTML de la página detalle |
| 10 | 2026-09-24 | dad34ec | Creacion de esqueleto para pagina formulario. Con base en los JS mapeados necesarios de momento | Formulario | Esqueleto HTML de la página formulario |
| 11 | 2026-09-25 | c944b09 | Creacion de navbar compartido | Navbar | Navbar reutilizable entre páginas |
| 12 | 2026-09-25 | 7bfb074 | Creacion de JS para carga de datos quemados en los JSON | JS / Datos | Carga de datos de prueba (hardcoded) desde JSON |
| 13 | 2026-09-25 | 7c8b13b | Creacion de JS para reglas de negocio en visibilidad | JS / Reglas de negocio | Lógica de visibilidad condicional de elementos |
| 14 | 2026-09-25 | c2357a1 | Creacion de JS para formulario, con validacion de campos | JS / Formulario | Validación de campos del formulario |
| 15 | 2026-09-25 | 65151dd | Creacion de JS para validacion | JS / Validación | Funciones de validación general |
| 16 | 2026-09-25 | 947a13d | Creacion de pagina base en HTML semantico para solicitud | Solicitud | Estructura semántica base de la página solicitud |
| 17 | 2026-09-25 | 3be9179 | Creacion de JS para perfil de usuario | JS / Perfil | Lógica JS para la página de perfil de usuario |
| 18 | 2026-09-26 | d52bd44 | Creacion de JS para solicitud | JS / Solicitud | Lógica JS para la página de solicitud |
| 19 | 2026-09-26 | 7004692 | Creacion de pagina HTML semantico para perfil y JS de catalogo | Perfil / Catálogo | HTML de perfil y JS del catálogo |
| 20 | 2026-09-26 | 1a2bcd7 | Agregar CDN de bootstrap a las paginas, para luego empatar y cambiar en CSS | Estilos | Inclusión del CDN de Bootstrap en todas las páginas |
| 21 | 2026-09-26 | 1d41874 | Creacion de JS para manejar reglas de negocio | JS / Reglas de negocio | Ampliación de la lógica de reglas de negocio |
| 22 | 2026-09-26 | 2b398fd | Editar el gitignore, para remover la compilacion de Sass | Configuración | Excluir archivos compilados de Sass del control de versiones |
| 23 | 2026-09-26 | dffd008 | Creaciones de paginas SCSS, usando bootstrap como base. Para compilar el CSS | Estilos / SCSS | Archivos SCSS base sobre Bootstrap para compilar el CSS |
| 24 | 2026-09-26 | 6db0da3 | Correciones en elementos y clases de Index.html, para matchear bootstrap | HTML / Index | Ajuste de elementos y clases para alinear con Bootstrap |
| 25 | 2026-09-26 | 4cd4ff6 | Cambio Sass y Bootstrap como dependencias, con nodejs | Configuración | Sass y Bootstrap gestionados como dependencias de npm |
| 26 | 2026-09-26 | e594c6b | CSS compilado con npm run css -- ls -la avance1/css/main.css | Estilos | Compilación del CSS final (main.css) desde SCSS |
| 27 | 2026-09-26 | fe01469 | Imagenes para el header y acorde a la identidad del hub | Imágenes / Header | Imágenes de header acorde a la identidad visual del hub |
| 28 | 2026-09-26 | 7e48e6a | Ajustes en HTML semantico para matchear botones/icones de Bootstrap y CSS compilado | HTML | Ajuste de botones e íconos para coincidir con Bootstrap y CSS compilado |
| 29 | 2026-09-26 | f060ab1 | Ajustes en archivos de JS acorde a las clases de Bootstrap y correciones en bugs de carga | JS | Ajustes de JS a clases de Bootstrap y corrección de bugs de carga |
| 30 | 2026-09-26 | 06e3d05 | Ajustes en datos JSON, para terminar con categorias con iconos | Datos / JSON | Categorías con íconos agregados en los datos JSON |
| 31 | 2026-09-26 | 7bda382 | Creacion de sesion.js para arreglar bug de visualizacion, al no existir una sesion en este Avance | JS / Sesión | sesion.js para manejar ausencia de sesión activa en este avance |
| 32 | 2026-09-26 | 3f53f5b | Ajustes en mensaje de error al cargar datos. Mejora de UX | JS / UX | Mensaje de error mejorado al fallar la carga de datos |
| 33 | 2026-09-26 | 7563611 | Agregar imagenes genai para landing page. Mejora visual | Imágenes / Landing | Imágenes generadas con IA para la landing page |
| 34 | 2026-09-27 | 575d11a | Ajustes en readme | Documentación | Ajustes en el README |
| 35 | 2026-09-27 | 0714c8c | Ajustes en readme | Documentación | Ajustes en el README |
| 36 | 2026-09-27 | 6be2a8e | Ajustes en readme | Documentación | Ajustes en el README |
| 37 | 2026-09-27 | f6127af | Ajustes en readme | Documentación | Ajustes en el README |
| 38 | 2026-09-27 | ab02b3b | Ajustes en readme y bug en el script de bash | Documentación | Ajustes en el README y corrección de bug en el script de bash |
| 39 | 2026-09-27 | 544c9e2 | Ajustes en readme y bug en el script de bash | General | Ajustes en readme y bug en el script de bash |
| 40 | 2026-09-27 | 7c0ab47 | Dejar de trackear herramientas/ y ajuste en readme segun consigna | General | Dejar de trackear herramientas/ y ajuste en readme segun consigna |
| 41 | 2026-10-26 | e437e75 | Crear el cliente React con Vite y dependencias | Cliente | Proyecto Vite con React Router, Bootstrap y Sass |
| 42 | 2026-10-26 | 685f5bc | Trasladar los estilos Sass y las imágenes del Avance 1 al cliente | Estilos | Mismo diseño compilado por Vite |
| 43 | 2026-10-26 | 70c9d9c | Agregar layout, navbar, pie y manejo de rutas inexistentes | General | Agregar layout, navbar, pie y manejo de rutas inexistentes |
| 44 | 2026-10-27 | 96e5633 | Mover la portada del Avance 1 a componentes React | General | Mover la portada del Avance 1 a componentes React |
| 45 | 2026-10-28 | 88faa2b | Traducir los datos del Avance 1 al formato del contrato del API | Datos | JSON con enums en inglés, equipo embebido y catálogo de roles, como mockup antes de BD |
| 46 | 2026-10-28 | 7ba54ab | Agregar reglas de negocio y servidor simulado con las rutas del contrato. Luego migrarlas a BD. | Cliente | Simulado temporal con visibilidad, solicitudes y proyectos |
| 47 | 2026-11-02 | 88fad42 | Agregar la capa de API y consulta | General | Agregar la capa de API y consulta |
| 48 | 2026-11-02 | 55a339e | Agregar componentes de estado, modal, badges, paginación y selector de sesión | Cliente | Componentes reutilizables con props y children |
| 49 | 2026-11-03 | 5b17281 | Agregar catálogo con filtros en la URL, orden y paginación | Catálogo | Filtros combinados resueltos por la API con estados de carga, error y vacío |
| 50 | 2026-11-03 | 2491dd4 | Agregar detalle completo y restringido, equipo y acciones del propietario | Detalle | RN-03 estricta y eliminación desde la lista |
| 51 | 2026-11-03 | 9e161f9 | Agregar formulario controlado para crear y editar iniciativas | Formulario | Visibilidad vacía, etiquetas como chips, confirmación al quitar y Cancelar como botón |
| 52 | 2026-11-03 | 6abc5f4 | Agregar mis solicitudes y solicitudes recibidas con filtros y resolución | Solicitudes | Modificar, cancelar, aceptar y rechazar con confirmación |
| 53 | 2026-11-03 | 9a483cd | Agregar proyectos, consumo de GitHub con manejo de errores y todas las rutas | Proyectos | Conversión del Avance 1 a React completa sobre el servidor simulado |
| 54 | 2026-11-03 | 061bfea | Documentar el modelo de datos con decisiones de embebido y referencia | Modelo de datos | Colecciones, índices, atomicidad y equivalencia en SQL |
| 55 | 2026-11-03 | 2058476 | Restaurar el layout de solicitudes con pestañas | Cliente | SolicitudesLayout con NavLink y Outlet para enviadas y recibidas |
| 56 | 2026-11-03 | b01861f | Crear el servidor Express con configuración, manejo central de errores y modelos | Servidor | Esquemas Mongoose con índices y formato de error del contrato |
| 57 | 2026-11-03 | 5cbeb06 | Agregar seed con los datos del Avance 1, catálogos y arranque del servidor | Servidor | Datos de prueba deterministas y CORS explícito |
| 58 | 2026-11-03 | 6ec68bd | Implementar iniciativas y equipo en el servidor con visibilidad y propiedad | Servidor | Filtros, orden y paginación en MongoDB; RN-03, RN-06 a RN-09 |
| 59 | 2026-11-04 | 8e485e2 | Implementar solicitudes, decisión con incorporación al equipo y proyectos | Servidor | RN-10 a RN-18 verificadas en el servidor con actualizaciones condicionales |
| 60 | 2026-11-04 | 52fe144 | Agregar colección Postman generada con casos por recurso | Pruebas | Correcto, inválido, inexistente y no autorizado; ejecución con Newman |
| 61 | 2026-11-04 | 611360b | Agregar login, registro, edición de perfil y búsqueda de personas en el cliente | Cliente | Sesión con token Bearer, rutas protegidas y gestión de competencias |
| 62 | 2026-11-05 | 91cb6d6 | Generar la colección de pruebas solo con autenticación JWT | Pruebas | Se elimina el modo de desarrollo X-Dev-User del generador |
| 63 | 2026-11-06 | 06bcc32 | Corregir README y verificar el build de producción | Cliente | Revisión de estados de interfaz, teclado y tamaños de pantalla |
| 64 | 2026-11-08 | 0587de3 | Validar las entradas | Servidor | Validadores con funciones que devuelven errores por campo y datos copiados campo por campo, como en las prácticas |
| 65 | 2026-11-08 | c17c8b2 | Actualizar el README | Documentación | README del Avance 2 completo |
| 66 | 2026-11-08 | 849c081 | Corregir documentación y estructura | Documentación | Readme y package.json de avance1 |
| 67 | 2026-11-08 | 83246ca | Actualizar los datos de prueba | Datos | Seed y colección con información de prueba |
| 68 | 2026-11-08 | f149b10 | Actualizar los datos de prueba | Datos | Seed y colección con información de prueba |
| 69 | 2026-11-08 | e0a82a2 | Actualizar los datos de prueba | Datos | Seed y colección con información de prueba |
| 70 | 2026-11-08 | 6aa645b | Actualizar los datos de prueba | Datos | Seed y colección con información de prueba |

<!-- FIN TABLA COMMITS -->
