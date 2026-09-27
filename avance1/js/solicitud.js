(() => {
  IH.ui.montarNavbar('solicitud.html', '../');
  const U = IH.ui;
  const V = IH.validacion;
  const $ = (id) => document.getElementById(id);
  const REGEX_DISPONIBILIDAD = /^\d{1,2}\s?h\/semana$/i;
  const val = (id) => $(id).value;

  function renderResumen(ini, ctx) {
    const propietario = ctx.usuarios.get(ini.propietario);
    const buscan = ini.competencias
      .map((id) => `<li>${U.chip(ctx.competencias.get(id)?.nombre ?? id, { icono: 'bi-stars' })}</li>`).join('');
    $('resumen-iniciativa').innerHTML = `<div class="card-body">
      <h2 class="seccion-titulo">Iniciativa</h2>
      <p class="fw-semibold mb-2"><a href="detalle.html?id=${encodeURIComponent(ini.id)}">${U.escapar(ini.titulo)}</a></p>
      <div class="d-flex flex-wrap gap-2 mb-3">${U.badgeTipo(ini.tipo)} ${U.chip(`${IH.reglas.espaciosDisponibles(ini)} espacios libres`, { icono: 'bi-person-plus' })}</div>
      <h2 class="seccion-titulo">Buscan</h2>
      <ul class="lista-chips mb-3">${buscan}</ul>
      <p class="small text-body-secondary mb-0">${U.icono('bi-person')} Tu solicitud llegará a <strong>${U.escapar(propietario?.nombre ?? 'el propietario')}</strong>.</p>
    </div>`;
    $('resumen-iniciativa').hidden = false;
  }

  function bloquear(mensaje) {
    $('bloqueo').hidden = false;
    $('bloqueo').innerHTML = `${U.icono('bi-info-circle-fill')}<div>${U.escapar(mensaje)}</div>`;
  }

  IH.ui.cargarPagina('../', () => {
    const ctx = IH.almacen.contexto();
    const id = new URLSearchParams(window.location.search).get('id');
    const ini = IH.almacen.obtenerIniciativa(id);
    if (!ini) { bloquear('No encontramos la iniciativa indicada.'); return; }

    renderResumen(ini, ctx);
    document.title = `Solicitar participación · ${ini.titulo}`;

    const usuario = IH.sesion.usuarioActual();
    const verificacion = IH.reglas.puedeSolicitar(ini, usuario, IH.almacen.obtenerSolicitudes());
    if (!verificacion.ok) { bloquear(verificacion.motivo); return; }

    const idsCompetencias = usuario.competencias.map((c) => c.id);
    $('competencia').innerHTML = '<option value="">Elegí una competencia…</option>' +
      usuario.competencias.map((c) => `<option value="${c.id}">${U.escapar(ctx.competencias.get(c.id)?.nombre ?? c.id)} · ${U.etiqueta('nivel', c.nivel)}</option>`).join('');
    if (usuario.disponibilidad?.horasSemana) $('disponibilidad').value = `${usuario.disponibilidad.horasSemana} h/semana`;
    $('formulario-solicitud').hidden = false;

    $('mensaje').addEventListener('input', () => { $('contador-mensaje').textContent = `${val('mensaje').length} / 300`; });

    $('formulario-solicitud').addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = V.validarCampos([
        ['mensaje', () => V.combinar(() => V.requerido(val('mensaje')), () => V.longitudMinima(val('mensaje'), 15), () => V.longitudMaxima(val('mensaje'), 300))],
        ['competencia', () => V.seleccionValida(val('competencia'), idsCompetencias)],
        ['rol', () => V.combinar(() => V.requerido(val('rol')), () => V.longitudMaxima(val('rol'), 40))],
        ['disponibilidad', () => V.combinar(() => V.requerido(val('disponibilidad')), () => V.formato(val('disponibilidad'), REGEX_DISPONIBILIDAD, 'Usá el formato "N h/semana", por ejemplo 4 h/semana.'))]
      ]);
      if (!ok) return;

      IH.almacen.agregarSolicitud({
        id: 'sol-' + Date.now(),
        iniciativaId: ini.id,
        usuarioId: usuario.id,
        mensaje: val('mensaje').trim(),
        competencia: val('competencia'),
        rol: val('rol').trim(),
        disponibilidad: val('disponibilidad').trim(),
        estado: 'pendiente',
        fecha: new Date().toISOString().slice(0, 10)
      });
      window.location.href = `detalle.html?id=${encodeURIComponent(ini.id)}&msg=solicitud`;
    });
  });
})();