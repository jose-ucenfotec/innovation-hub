document.getElementById('navbar').innerHTML = IH.ui.renderNavbar('solicitud.html', '../');
const USUARIO_ACTUAL_ID = 'u3';

async function iniciar() {
  const datos = await IH.datos.cargarDatos('../datos/');
  IH.almacen.inicializar(datos);

  const id = new URLSearchParams(window.location.search).get('id');
  const ini = IH.almacen.obtenerIniciativa(id);
  const usuarioActual = IH.almacen.obtenerUsuario(USUARIO_ACTUAL_ID);
  const verificacion = IH.reglas.puedeSolicitar(ini, usuarioActual, IH.almacen.obtenerSolicitudes());

  if (!verificacion.ok) {
    document.getElementById('bloqueo').hidden = false;
    document.getElementById('bloqueo').textContent = verificacion.motivo;
    return;
  }

  document.getElementById('formulario-solicitud').hidden = false;
  const selCompetencia = document.getElementById('competencia');
  selCompetencia.innerHTML = usuarioActual.competencias
    .map((cid) => `<option value="${cid}">${IH.ui.escapar(datos.competencias.find((c) => c.id === cid)?.nombre ?? cid)}</option>`)
    .join('');

  document.getElementById('formulario-solicitud').addEventListener('submit', (e) => {
    e.preventDefault();
    const V = IH.validacion;
    let valido = true;
    [
      ['mensaje', () => V.longitudMinima(document.getElementById('mensaje').value, 15)],
      ['rol', () => V.requerido(document.getElementById('rol').value)],
      ['disponibilidad', () => V.requerido(document.getElementById('disponibilidad').value)]
    ].forEach(([campo, validar]) => {
      const mensaje = validar();
      V.mostrarError(campo, mensaje);
      if (mensaje) valido = false;
    });
    if (!valido) return;

    IH.almacen.agregarSolicitud({
      id: 'sol-' + Date.now(),
      iniciativaId: ini.id,
      usuarioId: USUARIO_ACTUAL_ID,
      mensaje: document.getElementById('mensaje').value.trim(),
      competencia: document.getElementById('competencia').value,
      rol: document.getElementById('rol').value.trim(),
      disponibilidad: document.getElementById('disponibilidad').value.trim(),
      estado: 'pendiente',
      fecha: new Date().toISOString().slice(0, 10)
    });

    document.getElementById('formulario-solicitud').hidden = true;
    const exito = document.getElementById('exito');
    exito.hidden = false;
    exito.innerHTML = `Solicitud enviada (simulada). <a href="detalle.html?id=${ini.id}">Volver al detalle</a>`;
  });
}

iniciar();