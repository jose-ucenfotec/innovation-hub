(() => {
  IH.ui.montarNavbar('detalle.html', '../');
  const U = IH.ui;
  const R = IH.reglas;
  const $ = (id) => document.getElementById(id);

  function obtenerIdDeUrl() {
    return new URLSearchParams(window.location.search).get('id');
  }

  function renderBloqueado(ini) {
    const motivo = ini.visibilidad === 'institucional'
      ? 'requiere iniciar sesión. Elegí un usuario en "Ver como" para continuar.'
      : 'solo la pueden consultar el propietario y los miembros de su equipo.';
    $('detalle').innerHTML = `
      <div class="alert alert-danger d-flex gap-2" role="alert">
        ${U.icono('bi-lock-fill')}
        <div><strong>Sin acceso.</strong> Esta iniciativa es <strong>${U.escapar(U.etiqueta('visibilidad', ini.visibilidad).toLowerCase())}</strong> y ${motivo}</div>
      </div>
      <a class="btn btn-outline-primary" href="catalogo.html">${U.icono('bi-arrow-left')} Volver al catálogo</a>`;
  }

  function renderAcciones(ini, usuario) {
    if (!R.esPropietario(ini, usuario)) {
      return `<a class="btn btn-primary" href="solicitud.html?id=${encodeURIComponent(ini.id)}">${U.icono('bi-send')} Solicitar participación</a>`;
    }
    const puedeConvertir = R.puedeConvertirseEnProyecto(ini);
    const notaConvertir = puedeConvertir ? '' : `<p class="small text-body-secondary mb-0 mt-1">${
      ini.estado === 'proyecto' ? 'Esta iniciativa ya es un proyecto.'
      : ini.estado === 'archivada' ? 'Una iniciativa archivada no puede convertirse en proyecto.'
      : 'Para convertirla en proyecto necesita al menos un integrante además del propietario.'}</p>`;
    const editar = R.puedeEditarse(ini)
      ? `<a class="btn btn-outline-primary" href="formulario.html?id=${encodeURIComponent(ini.id)}">${U.icono('bi-pencil')} Editar</a>`
      : `<button type="button" class="btn btn-outline-primary" disabled>${U.icono('bi-pencil')} Editar</button>`;
    return `${editar}
      <button type="button" class="btn btn-outline-danger" id="btn-eliminar">${U.icono('bi-trash3')} Eliminar</button>
      <button type="button" class="btn btn-primary" id="btn-convertir" ${puedeConvertir ? '' : 'disabled'}>${U.icono('bi-rocket-takeoff')} Convertir en proyecto</button>
      ${notaConvertir}`;
  }

  function render(ini) {
    const ctx = IH.almacen.contexto();
    const usuario = IH.sesion.usuarioActual();
    const nivel = R.nivelDeAcceso(ini, usuario);

    if (nivel === 'bloqueado') { renderBloqueado(ini); return; }

    const categoria = ctx.categorias.get(ini.categoria);
    const propietario = ctx.usuarios.get(ini.propietario);
    const espacios = R.espaciosDisponibles(ini);

    const competencias = ini.competencias
      .map((id) => `<li>${U.chip(ctx.competencias.get(id)?.nombre ?? id, { icono: 'bi-stars' })}</li>`).join('');
    const etiquetas = ini.etiquetas.map((t) => `<li>${U.chip('#' + t, { neutro: true })}</li>`).join('')
      || '<li class="small text-body-secondary">Sin etiquetas</li>';
    const equipo = [ini.propietario, ...ini.equipo].map((id) => {
      const u = ctx.usuarios.get(id);
      const rol = id === ini.propietario ? 'propietario' : (u?.carrera ?? '');
      return `<li class="d-flex align-items-center gap-2 mb-2">${U.avatar(u)}
        <span>${U.escapar(u?.nombre ?? id)} <span class="small text-body-secondary">· ${U.escapar(rol)}</span></span></li>`;
    }).join('');

    const cuerpo = nivel === 'resumen'
      ? `<div class="alert alert-warning d-flex gap-2" role="status">
           ${U.icono('bi-info-circle-fill')}
           <div><strong>Iniciativa restringida:</strong> solo se muestra el resumen. La descripción completa es visible para el propietario y los miembros del equipo.</div>
         </div>
         <p class="lead">${U.escapar(ini.resumen)}</p>`
      : `<p class="lead">${U.escapar(ini.resumen)}</p>
         <p>${U.escapar(ini.descripcion)}</p>
         <div class="row g-3 mt-2">
           <div class="col-md-6"><div class="bloque-acento h-100"><h2 class="seccion-titulo">Problema identificado</h2><p class="mb-0">${U.escapar(ini.problema)}</p></div></div>
           <div class="col-md-6"><div class="bloque-acento bloque-acento--teal h-100"><h2 class="seccion-titulo">Beneficiarios</h2><p class="mb-0">${U.escapar(ini.beneficiarios)}</p></div></div>
         </div>
         <h2 class="seccion-titulo mt-4">Etiquetas</h2>
         <ul class="lista-chips">${etiquetas}</ul>`;

    $('detalle').innerHTML = `<article class="row g-4">
      <div class="col-lg-8">
        <a class="small text-body-secondary d-inline-block mb-2" href="catalogo.html">${U.icono('bi-arrow-left')} Volver al catálogo</a>
        <h1 class="h2 mb-2">${U.escapar(ini.titulo)}</h1>
        <div class="d-flex flex-wrap gap-2 mb-2">${U.badgeTipo(ini.tipo)} ${U.badgeEstado(ini.estado)} ${U.badgeVisibilidad(ini.visibilidad)}</div>
        <p class="small text-body-secondary d-flex flex-wrap gap-3 mb-3">
          <span>${U.icono(categoria?.icono ?? 'bi-tag')} ${U.escapar(categoria?.nombre ?? 'Sin categoría')}</span>
          <span>${U.icono('bi-person')} ${U.escapar(propietario?.nombre ?? 'Desconocido')}</span>
          <span>${U.icono('bi-calendar-event')} Publicada ${U.formatearFecha(ini.fechaCreacion)}</span>
          <span>${U.icono('bi-pencil')} Editada ${U.formatearFecha(ini.fechaModificacion)}</span>
        </p>
        ${cuerpo}
      </div>
      <aside class="col-lg-4">
        <div class="card tarjeta-lateral"><div class="card-body">
          <div class="row g-2 mb-3">
            <div class="col-6"><div class="metrica"><div class="seccion-titulo">Integrantes</div><div class="valor">${ini.equipo.length + 1} <small class="fs-6 fw-normal text-body-secondary">de ${ini.participantesEstimados}</small></div></div></div>
            <div class="col-6"><div class="metrica metrica--acento"><div class="seccion-titulo">Espacios</div><div class="valor">${espacios} <small class="fs-6 fw-normal">libres</small></div></div></div>
          </div>
          <h2 class="seccion-titulo">Equipo</h2>
          <ul class="list-unstyled mb-3">${equipo}</ul>
          <h2 class="seccion-titulo">Competencias requeridas</h2>
          <ul class="lista-chips mb-4">${competencias}</ul>
          <div class="d-grid gap-2">${renderAcciones(ini, usuario)}</div>
        </div></div>
      </aside>
    </article>`;

    $('btn-convertir')?.addEventListener('click', () => {
      IH.almacen.actualizarIniciativa(ini.id, { estado: 'proyecto' });
      U.toast('La iniciativa ahora es un proyecto.', 'info');
      render(IH.almacen.obtenerIniciativa(ini.id));
    });
    $('btn-eliminar')?.addEventListener('click', () => abrirConfirmacion(ini));
  }

  // Mostrar título, acción y mensaje antes de confirmar.
  function abrirConfirmacion(ini) {
    const r = IH.almacen.relaciones(ini.id);
    const archivar = r.miembros > 0 || r.solicitudes > 0 || r.tieneProyecto;
    $('modal-titulo').innerHTML = `${U.icono('bi-exclamation-triangle-fill')} <span class="ms-1">${archivar ? 'Archivar iniciativa' : 'Eliminar iniciativa'}</span>`;
    $('modal-nombre').textContent = ini.titulo;
    $('modal-mensaje').textContent = archivar
      ? `Tiene ${r.miembros} integrante(s) y ${r.solicitudes} solicitud(es), así que se archivará en lugar de eliminarse. ¿Querés continuar?`
      : 'No tiene equipo ni solicitudes: se eliminará de forma definitiva. ¿Querés continuar?';
    const btn = $('modal-confirmar');
    btn.innerHTML = archivar ? `${U.icono('bi-archive')} Archivar` : `${U.icono('bi-trash3')} Eliminar`;
    btn.onclick = () => {
      const resultado = IH.almacen.eliminarOArchivar(ini.id);
      window.location.href = `catalogo.html?msg=${resultado}`;
    };
    bootstrap.Modal.getOrCreateInstance($('modal-confirmacion')).show();
  }

  IH.ui.cargarPagina('../', () => {
    const ini = IH.almacen.obtenerIniciativa(obtenerIdDeUrl());
    $('detalle').hidden = false;
    if (!ini) {
      $('detalle').innerHTML = `
        <div class="alert alert-warning d-flex gap-2" role="alert">${U.icono('bi-question-circle')}<div>No encontramos esa iniciativa. Puede haberse eliminado.</div></div>
        <a class="btn btn-outline-primary" href="catalogo.html">${U.icono('bi-arrow-left')} Volver al catálogo</a>`;
      return;
    }
    document.title = `${ini.titulo} · Innovation Hub`;
    render(ini);
    IH.ui.mostrarMensajeDeUrl();
  });
})();