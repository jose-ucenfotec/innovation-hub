# Innovation Hub
 
Proyecto del curso SOFT-12 — Desarrollo Web Full Stack.
 
**Estudiante:** Jose Ricardo Barrantes Saenz
**Sección:** SCV2    **Periodo:** III cuatrimestre 2026
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
 
Abrir `avance1/index.html` en el navegador. No requiere instalación.
 
## Decisiones de diseño
 
_(se completa durante las semanas 2 a 4)_
 
## Resumen de commits

<!-- INICIO TABLA COMMITS -->
| # | Fecha | Hash | Mensaje |
|---|-------|------|---------|
| 1 | 2026-09-14 | 9726a0b | Crear estructura del avance 1 y documentacion inicial |
| 2 | 2026-09-14 | f9593e9 | Automatizar la tabla de commits del README |
| 3 | 2026-09-14 | f75aa83 | Marcar los scripts como ejecutables |
| 4 | 2026-09-14 | 4ed592b | Actualizar tabla de commits |
| 5 | 2026-09-15 | 4526bff | Creacion de HTML base semantico y la seccion catalogo de manera estructurada |
| 6 | 2026-09-18 | 308f2ee | Modificar index.html con base en uso de bootstrap |
| 7 | 2026-09-24 | e045ca8 | Creacion de JSON para los key-value pair de esta primer entrega, con base en las necesidades de la pagina. Ajustes en index para reflejar el JS que los llamara |
| 8 | 2026-09-24 | 0a6e481 | Creacion de esqueleto para pagina catalogo. Con base en los JS mapeados necesarios de momento |
| 9 | 2026-09-24 | 9cea2c6 | Creacion de esqueleto para pagina detalle. Con base en los JS mapeados necesarios de momento |
| 10 | 2026-09-24 | dad34ec | Creacion de esqueleto para pagina formulario. Con base en los JS mapeados necesarios de momento |
| 11 | 2026-09-25 | c944b09 | Creacion de navbar compartido |

<!-- FIN TABLA COMMITS -->

## Automatización de la tabla de commits

La tabla anterior se genera con `herramientas/tabla-commits.sh`, que lee el
historial real del repositorio y reemplaza únicamente el contenido entre las
marcas `<!-- INICIO TABLA COMMITS -->` y `<!-- FIN TABLA COMMITS -->`.

Para regenerarla manualmente:

    bash herramientas/tabla-commits.sh

Para que se actualice sola en cada commit hay que instalar el hook. La carpeta
`.git` no se versiona, así que cada persona debe instalarlo en su copia local
después de clonar:

    cp herramientas/pre-commit .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit

Nota: el hook `pre-commit` se ejecuta antes de que el commit exista, por lo que
la tabla refleja el historial hasta el commit anterior.

Si el hook llegara a impedir los commits, se desactiva borrándolo:

    rm .git/hooks/pre-commit
