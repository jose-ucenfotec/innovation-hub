# Innovation Hub
 
Proyecto del curso SOFT-12 — Desarrollo Web Full Stack.
 
**Estudiante:** Jose Ricardo Barrantes Saenz

**Sección:** SCV2   

**Periodo:** III cuatrimestre 2026

**Docente:** Alvaro Cordero Pena
 
## Descripción
 
Aplicación web que permite publicar ideas, necesidades y retos,
declarar las competencias que cada iniciativa requiere y conformar
equipos interdisciplinarios dentro de la comunidad universitaria.
 
## Estructura del repositorio
 
- `avance1/` - prototipo con HTML, CSS, JavaScript, Bootstrap y Sass
  - `paginas/` - pantallas del prototipo
  - `datos/`   - archivos JSON con datos simulados
  - `js/`      - módulos de JavaScript
  - `scss/`    - variables y parciales de Sass
  - `css/`     - hoja de estilos compilada
 
## Cómo ejecutar
 
Debido a las acciones fetch del JS y la necesidad de JSON para este avance, el fetch falla si se carga como un avance, para la visualizacion de datos.
La pagina se puede abrir de dos maneras segun el proposito final:

1. Para visualizacion e inspecion del diseno con clonar el repo y abrir index.html sera suficiente, sin embargo ninguna otra pagina cargara dato y mostrara mensaje de error.
2. Para una correcta visualizacion de los datos y mejor experiencia de usuario se requiere la extension "Live Server" en IDE de preferencia o si se tiene Python instalado, se podria ejectuar un local server de la siguiente manera desde la raiz del repo:
        a. python3 -m http.server 5500
        b. Luego abrir http://localhost:5500/index.html

## Decisiones de diseño
 
1. **Sass sobre Bootstrap.** `scss/_variables.scss` sobrescribe algunas variables  (colores de tema, tipografía, radios, espaciado, formularios,
   navbar, modal, toast) antes de importar Bootstrap. Los parciales `_base`, `_navbar`, `_hero`, `_tarjetas` y `_formularios` agregan solo lo que Bootstrap no ofrece.
2. **Identidad visual.** Pense en la identidad de marca de Cenfotec, con un fuerte color azul como color primario primario `#2563EB`. Luego, tomando en cuenta
   que es un proyecto independiente opte por una paleta de colores mas viva, que tuviera relacion directa en la rueda de colores con ese azul. Un degradado marino → azul →
   petróleo en el hero, verde menta y ámbar para necesidad y reto. Tipografía Sora para títulos y DM Sans para texto. Botones y badges en forma de píldora,
   tarjetas sin borde con sombra suave. Iconografía de Bootstrap Icons para mayor facilidad no buscarlos en otro lugar o generarlos uno a uno.
3. **Contenido generado desde datos.** Tarjetas, detalle, perfil, selects y badges se construyen en JavaScript a partir de los JSON para esta primer entrega que no 
   hay bases de datos. El HTML solo contiene la estructura y el contenido fijo de la portada.
4. **Persistencia.** Los JSON son los datos estaticos para esta entrega. Las altas, ediciones,
   eliminaciones y solicitudes se guardan además en `localStorage` para que el catálogo refleje los cambios entre páginas, y la experiencia visual sea un poco mas enriquecedora. 
   El botón **Restablecer datos de ejemplo** del perfil vuelve a los JSON originales.
5. **Eliminar o archivar.** Si la iniciativa tiene equipo, solicitudes o proyecto, se archiva en lugar de eliminarse como pide las reglas de negocio. La confirmación se hace con
   un modal de Bootstrap que muestra el título y la acción que se ejecutará.
6. **Validación propia.** Obligatoriedad, longitud mínima y máxima, rango,
   selección válida, formato (etiquetas y disponibilidad) y relación entre campos
   (los integrantes estimados no pueden ser menos que el equipo actual). Los
   mensajes son específicos por campo y se anuncian con `aria-invalid` y
   `aria-describedby`.
7. **Accesibilidad.** HTML semántico, enlace para saltar al contenido, jerarquía
   de encabezados, etiquetas asociadas, pestañas con roles ARIA y navegación por
   teclado, textos alternativos, estados que combinan icono, texto y color, y
   respeto a `prefers-reduced-motion`.
8. **Preparación para el Avance 2.** Cada página es un módulo con estado propio. Lo que facilitaria la escalabilidad o movilidad.
 
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

<!-- FIN TABLA COMMITS -->
