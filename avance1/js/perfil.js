document.getElementById('navbar').innerHTML = IH.ui.renderNavbar('perfil.html', '../');
const USUARIO_ACTUAL_ID = 'u1';

function renderPestana(tab, usuario) {
  const todas = IH.almacen.obtenerIniciativas();
  if (tab === 'propias') {
    const propias = todas.filter((i) => i.propietario === usuario.id);
    return propias.map((i) => `<p>${IH.ui.escapar(i.titulo)} ${IH.ui.badgeEstado(i.estado)}</p>`).join('') || '<p class="text-body-secondary">No has publicado iniciativas todavía.</p>';
  }
  if (tab === 'participo') {
    const participa = todas.filter((i) => i.equipo.includes(usuario.id));
    return participa.map((i) => `<p>${IH.ui.escapar(i.titulo)} ${IH.ui.badgeEstado(i.estado)}</p>`).join('') || '<p class="text-body-secondary">Todavía no formás parte de ningún equipo.</p>';
  }
  const misSolicitudes = IH.almacen.obtenerSolicitudes().filter((s) => s.usuarioId === usuario.id);
  return misSolicitudes.map((s) => {
    const ini = IH.almacen.obtenerIniciativa(s.iniciativaId);
    const color = { pendiente: 'warning', aceptada: 'success', rechazada: 'danger', cancelada: 'secondary' }[s.estado];
    return `<p>${IH.ui.escapar(ini?.titulo ?? s.iniciativaId)} — <span class="badge text-bg-${color}">${s.estado}</span></p>`;
  }).join('') || '<p class="text-body-secondary">No has enviado solicitudes.</p>';
}

async function iniciar() {
  const datos = await IH.datos.cargarDatos('../datos/');
  IH.almacen.inicializar(datos);
  const usuario = IH.almacen.obtenerUsuario(USUARIO_ACTUAL_ID);

  document.getElementById('tarjeta-perfil').innerHTML = `
    <h1 class="h5">${IH.ui.escapar(usuario.nombre)}</h1>
    <p class="text-body-secondary small">${IH.ui.escapar(usuario.carrera)} · ${IH.ui.escapar(usuario.correo)}</p>
    <p>${IH.ui.escapar(usuario.bio || 'Sin biografía todavía.')}</p>
    <h2 class="h6 text-uppercase text-body-secondary">Competencias</h2>
    <ul class="list-inline">${usuario.competencias.map((id) => `<li class="list-inline-item badge text-bg-light border">${IH.ui.escapar(id)}</li>`).join('')}</ul>`;

  document.getElementById('contenido-pestanas').innerHTML = renderPestana('propias', usuario);

  document.getElementById('pestanas').addEventListener('click', (e) => {
    const boton = e.target.closest('button[data-tab]');
    if (!boton) return;
    document.querySelectorAll('#pestanas .nav-link').forEach((b) => b.classList.remove('active'));
    boton.classList.add('active');
    document.getElementById('contenido-pestanas').innerHTML = renderPestana(boton.dataset.tab, usuario);
  });
}

iniciar();