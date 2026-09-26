document.getElementById('navbar').innerHTML = IH.ui.renderNavbar('detalle.html', '../');

// Simulación de sesión
const USUARIO_ACTUAL_ID = 'u1';

function obtenerIdDeUrl() {
  return new URLSearchParams(window.location.search).get('id');
}

function render(ini) {
  const ctx = IH.almacen.contexto();
  const usuarioActual = IH.almacen.obtenerUsuario(USUARIO_ACTUAL_ID);
  const nivel = IH.reglas.nivelDeAcceso(ini, usuarioActual);
  const cont = document.getElementById('detalle');

  if (nivel === 'bloqueado') {
    cont.innerHTML = `<div class="alert alert-danger" role="alert">Esta iniciativa es <strong>${ini.visibilidad}</strong> y no tenés acceso a su contenido.</div>`;
    return;
  }

  const categoria = ctx.categorias.get(ini.categoria)?.nombre ?? 'Sin categoría';
  const autor = ctx.usuarios.get(ini.propietario)?.nombre ?? 'Desconocido';
  const equipo = ini.equipo.map((id) => `<li>${IH.ui.escapar(ctx.usuarios.get(id)?.nombre ?? id)}</li>`).join('') || '<li class="text-body-secondary">Sin integrantes todavía</li>';
  const competencias = ini.competencias.map((id) => `<li class="list-inline-item badge text-bg-light border">${IH.ui.escapar(ctx.competencias.get(id)?.nombre ?? id)}</li>`).join('');

  const cuerpo = nivel === 'resumen'
    ? `<div class="alert alert-warning" role="status">Esta iniciativa es <strong>restringida</strong>: solo se muestra el resumen.</div>
       <p>${IH.ui.escapar(ini.resumen)}</p>`
    : `<p class="lead">${IH.ui.escapar(ini.resumen)}</p>
       <p>${IH.ui.escapar(ini.descripcion)}</p>
       <h2 class="h6 text-uppercase text-body-secondary mt-3">Problema</h2>
       <p>${IH.ui.escapar(ini.problema)}</p>
       <h2 class="h6 text-uppercase text-body-secondary">Beneficiarios</h2>
       <p>${IH.ui.escapar(ini.beneficiarios)}</p>`;

  const esPropietario = IH.reglas.esPropietario(ini, usuarioActual);
  const puedeConvertir = IH.reglas.puedeConvertirseEnProyecto(ini);

  const acciones = [];
  if (esPropietario) {
    acciones.push(`<a class="btn btn-outline-primary" href="formulario.html?id=${ini.id}">Editar</a>`);
    acciones.push(`<button type="button" class="btn btn-outline-danger" id="btn-eliminar">Eliminar</button>`);
    acciones.push(`<button type="button" class="btn btn-primary" id="btn-convertir" ${puedeConvertir ? '' : 'disabled'}>Convertir en proyecto</button>`);
  } else {
    acciones.push(`<a class="btn btn-primary" href="solicitud.html?id=${ini.id}">Solicitar participación</a>`);
  }

  cont.innerHTML = `<article class="row g-4">
    <div class="col-lg-8">
      <div class="d-flex gap-2 align-items-start mb-2">
        <h1 class="h3 mb-0">${IH.ui.escapar(ini.titulo)}</h1>
        ${IH.ui.badgeTipo(ini.tipo)} ${IH.ui.badgeEstado(ini.estado)}
      </div>
      <p class="small text-body-secondary">Visibilidad: ${IH.ui.escapar(ini.visibilidad)} · Categoría: ${IH.ui.escapar(categoria)} · Autor: ${IH.ui.escapar(autor)}</p>
      ${cuerpo}
    </div>
    <aside class="col-lg-4">
      <div class="card"><div class="card-body">
        <h2 class="h6 text-uppercase text-body-secondary">Equipo</h2>
        <ul class="list-unstyled mb-3">${equipo}</ul>
        <h2 class="h6 text-uppercase text-body-secondary">Competencias</h2>
        <ul class="list-inline">${competencias}</ul>
        <div class="d-grid gap-2 mt-3">${acciones.join('')}</div>
      </div></div>
    </aside>
  </article>`;

  document.getElementById('btn-convertir')?.addEventListener('click', () => {
    IH.almacen.actualizarIniciativa(ini.id, { estado: 'proyecto' });
    render(IH.almacen.obtenerIniciativa(ini.id));
  });
  document.getElementById('btn-eliminar')?.addEventListener('click', () => {
    if (!confirm('¿Seguro que querés eliminar esta iniciativa?')) return;
    const resultado = IH.almacen.eliminarOArchivar(ini.id);
    alert(resultado === 'archivada' ? 'Tiene equipo o solicitudes: se archivó en vez de eliminarse.' : 'Iniciativa eliminada.');
    window.location.href = 'catalogo.html';
  });
}

async function iniciar() {
  const datos = await IH.datos.cargarDatos('../datos/');
  IH.almacen.inicializar(datos);
  document.getElementById('cargando').hidden = true;
  document.getElementById('detalle').hidden = false;
  render(IH.almacen.obtenerIniciativa(obtenerIdDeUrl()));
}

iniciar();