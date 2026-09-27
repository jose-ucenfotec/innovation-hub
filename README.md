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
| # | Fecha | Hash | Mensaje | Sección | Cambio |
|---|-------|------|---------|---------------------|------------------|
| 1 | 2026-09-14 | 9726a0b | Crear estructura del avance 1 y documentacion inicial | General | Crear estructura del avance 1 y documentacion inicial |
| 2 | 2026-09-14 | f9593e9 | Automatizar la tabla de commits del README | General | Automatizar la tabla de commits del README |
| 3 | 2026-09-14 | f75aa83 | Marcar los scripts como ejecutables | General | Marcar los scripts como ejecutables |
| 4 | 2026-09-14 | 4ed592b | Actualizar tabla de commits | General | Actualizar tabla de commits |
| 5 | 2026-09-15 | 4526bff | Creacion de HTML base semantico y la seccion catalogo de manera estructurada | General | Creacion de HTML base semantico y la seccion catalogo de manera estructurada |
| 6 | 2026-09-18 | 308f2ee | Modificar index.html con base en uso de bootstrap | General | Modificar index.html con base en uso de bootstrap |
| 7 | 2026-09-24 | e045ca8 | Creacion de JSON para los key-value pair de esta primer entrega, con base en las necesidades de la pagina. Ajustes en index para reflejar el JS que los llamara | General | Creacion de JSON para los key-value pair de esta primer entrega, con base en las necesidades de la pagina. Ajustes en index para reflejar el JS que los llamara |
| 8 | 2026-09-24 | 0a6e481 | Creacion de esqueleto para pagina catalogo. Con base en los JS mapeados necesarios de momento | General | Creacion de esqueleto para pagina catalogo. Con base en los JS mapeados necesarios de momento |
| 9 | 2026-09-24 | 9cea2c6 | Creacion de esqueleto para pagina detalle. Con base en los JS mapeados necesarios de momento | General | Creacion de esqueleto para pagina detalle. Con base en los JS mapeados necesarios de momento |
| 10 | 2026-09-24 | dad34ec | Creacion de esqueleto para pagina formulario. Con base en los JS mapeados necesarios de momento | General | Creacion de esqueleto para pagina formulario. Con base en los JS mapeados necesarios de momento |
| 11 | 2026-09-25 | c944b09 | Creacion de navbar compartido | General | Creacion de navbar compartido |
| 12 | 2026-09-25 | 7bfb074 | Creacion de JS para carga de datos quemados en los JSON | General | Creacion de JS para carga de datos quemados en los JSON |
| 13 | 2026-09-25 | 7c8b13b | Creacion de JS para reglas de negocio en visibilidad | General | Creacion de JS para reglas de negocio en visibilidad |
| 14 | 2026-09-25 | c2357a1 | Creacion de JS para formulario, con validacion de campos | General | Creacion de JS para formulario, con validacion de campos |
| 15 | 2026-09-25 | 65151dd | Creacion de JS para validacion | General | Creacion de JS para validacion |
| 16 | 2026-09-25 | 947a13d | Creacion de pagina base en HTML semantico para solicitud | General | Creacion de pagina base en HTML semantico para solicitud |
| 17 | 2026-09-25 | 3be9179 | Creacion de JS para perfil de usuario | General | Creacion de JS para perfil de usuario |
| 18 | 2026-09-26 | d52bd44 | Creacion de JS para solicitud | General | Creacion de JS para solicitud |
| 19 | 2026-09-26 | 7004692 | Creacion de pagina HTML semantico para perfil y JS de catalogo | General | Creacion de pagina HTML semantico para perfil y JS de catalogo |
| 20 | 2026-09-26 | 1a2bcd7 | Agregar CDN de bootstrap a las paginas, para luego empatar y cambiar en CSS | General | Agregar CDN de bootstrap a las paginas, para luego empatar y cambiar en CSS |
| 21 | 2026-09-26 | 1d41874 | Creacion de JS para manejar reglas de negocio | General | Creacion de JS para manejar reglas de negocio |
| 22 | 2026-09-26 | 2b398fd | Editar el gitignore, para remover la compilacion de Sass | General | Editar el gitignore, para remover la compilacion de Sass |
| 23 | 2026-09-26 | dffd008 | Creaciones de paginas SCSS, usando bootstrap como base. Para compilar el CSS | General | Creaciones de paginas SCSS, usando bootstrap como base. Para compilar el CSS |
| 24 | 2026-09-26 | 6db0da3 | Correciones en elementos y clases de Index.html, para matchear bootstrap | General | Correciones en elementos y clases de Index.html, para matchear bootstrap |
| 25 | 2026-09-26 | 4cd4ff6 | Cambio Sass y Bootstrap como dependencias, con nodejs | General | Cambio Sass y Bootstrap como dependencias, con nodejs |
| 26 | 2026-09-26 | e594c6b | CSS compilado con npm run css -- ls -la avance1/css/main.css | General | CSS compilado con npm run css -- ls -la avance1/css/main.css |
| 27 | 2026-09-26 | fe01469 | Imagenes para el header y acorde a la identidad del hub | General | Imagenes para el header y acorde a la identidad del hub |
| 28 | 2026-09-26 | 7e48e6a | Ajustes en HTML semantico para matchear botones/icones de Bootstrap y CSS compilado | General | Ajustes en HTML semantico para matchear botones/icones de Bootstrap y CSS compilado |
| 29 | 2026-09-26 | f060ab1 | Ajustes en archivos de JS acorde a las clases de Bootstrap y correciones en bugs de carga | General | Ajustes en archivos de JS acorde a las clases de Bootstrap y correciones en bugs de carga |
| 30 | 2026-09-26 | 06e3d05 | Ajustes en datos JSON, para terminar con categorias con iconos | General | Ajustes en datos JSON, para terminar con categorias con iconos |
| 31 | 2026-09-26 | 7bda382 | Creacion de sesion.js para arreglar bug de visualizacion, al no existir una sesion en este Avance | General | Creacion de sesion.js para arreglar bug de visualizacion, al no existir una sesion en este Avance |
| 32 | 2026-09-26 | 3f53f5b | Ajustes en mensaje de error al cargar datos. Mejora de UX | General | Ajustes en mensaje de error al cargar datos. Mejora de UX |
| 33 | 2026-09-26 | 7563611 | Agregar imagenes genai para landing page. Mejora visual | General | Agregar imagenes genai para landing page. Mejora visual |
| 34 | 2026-09-27 | 575d11a | Ajustes en readme | General | Ajustes en readme |
| 35 | 2026-09-27 | 0714c8c | Ajustes en readme | General | Ajustes en readme |
| 36 | 2026-09-27 | 6be2a8e | Ajustes en readme | General | Ajustes en readme |
| 37 | 2026-09-27 | f6127af | Ajustes en readme | General | Ajustes en readme |
| 38 | 2026-09-27 | ab02b3b | Ajustes en readme y bug en el script de bash | General | Ajustes en readme y bug en el script de bash |

<!-- FIN TABLA COMMITS -->
