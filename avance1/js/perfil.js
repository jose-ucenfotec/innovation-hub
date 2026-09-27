(() => {
  IH.ui.montarNavbar('perfil.html', '../');
  const U = IH.ui;
  const $ = (id) => document.getElementById(id);

  function renderTarjeta(usuario) {
    const ctx = IH.almacen.contexto();
    const disponible = (usuario.disponibilidad?.horasSemana ?? 0) > 0;
    const competencias = usuario.competencias
      .map((c) => `<li>${U.chip(ctx.competencias.get(c.id)?.nombre ?? c.id, { nivel: c.nivel })}</li>`).join('')
      || '<li class="small text-body-secondary">Sin competencias registradas.</li>';
    const intereses = usuario.intereses.map((i) => `<li>${U.chip('#' + i, { neutro: true })}</li>`).join('')
      || '<li class="small text-body-secondary">Sin intereses registrados.</li>';
    const portafolio = usuario.portafolio
      ? `<p class="small mb-2"><a href="${U.escapar(usuario.portafolio)}" target="_blank" rel="noopener">${U.icono('bi-link-45deg')} ${U.escapar(usuario.portafolio.replace(/^https?:\/\//, ''))}</a></p>`
      : '';

    $('tarjeta-perfil').innerHTML = `
      <div class="text-center">
        ${U.avatar(usuario, true)}
        <h2 class="h4 mt-3 mb-1">${U.escapar(usuario.nombre)}</h2>
        <div class="d-flex justify-content-center flex-wrap gap-2 mb-2">
          ${U.chip(U.etiqueta('tipoMiembro', usuario.tipoMiembro), { icono: U.iconoDe('tipoMiembro', usuario.tipoMiembro) })}
          <span class="badge ${disponible ? 'text-bg-success' : 'text-bg-secondary'}">${U.icono(disponible ? 'bi-check-circle-fill' : 'bi-pause-circle')} ${disponible ? 'Disponible' : 'Sin disponibilidad'}</span>
        </div>
        <p class="small text-body-secondary mb-1">${U.icono('bi-book')} ${U.escapar(usuario.carrera)}</p>
        <p class="small text-body-secondary mb-1">${U.icono('bi-clock')} ${disponible ? `${usuario.disponibilidad.horasSemana} h/semana · ${U.escapar(usuario.disponibilidad.detalle)}` : 'No disponible por ahora'}</p>
        ${portafolio}
        <p class="small">${U.escapar(usuario.bio || 'Sin descripción todavía.')}</p>
      </div>
      <h3 class="seccion-titulo mt-3">Competencias</h3>
      <ul class="lista-chips mb-3">${competencias}</ul>
      <h3 class="seccion-titulo">Intereses</h3>
      <ul class="lista-chips">${intereses}</ul>`;
  }

  function filaIniciativa(i, ctx) {
    const cat = ctx.categorias.get(i.categoria);
    return `<a class="fila-lista" href="detalle.html?id=${encodeURIComponent(i.id)}">
      <span>
        <span class="fw-semibold d-block">${U.escapar(i.titulo)}</span>
        <span class="small text-body-secondary">${U.icono(cat?.icono ?? 'bi-tag')} ${U.escapar(cat?.nombre ?? '')} · ${i.equipo.length + 1} de ${i.participantesEstimados} integrantes previstos</span>
      </span>
      <span class="d-flex gap-2 align-items-center flex-shrink-0">${U.badgeTipo(i.tipo)} ${U.badgeEstado(i.estado)} ${U.icono('bi-chevron-right')}</span>
    </a>`;
  }

  function vacio(texto) {
    return `<div class="estado-vacio text-center py-4">
      <img src="../img/vacio-catalogo.svg" alt="" width="160" height="116" class="mb-2">
      <p class="text-body-secondary mb-0">${texto}</p></div>`;
  }

  function renderPestana(tab, usuario) {
    const ctx = IH.almacen.contexto();
    const todas = IH.almacen.obtenerIniciativas();
    if (tab === 'propias') {
      const l = todas.filter((i) => i.propietario === usuario.id);
      return l.map((i) => filaIniciativa(i, ctx)).join('') || vacio('No has publicado iniciativas todavía.');
    }
    if (tab === 'participo') {
      const l = todas.filter((i) => i.equipo.includes(usuario.id));
      return l.map((i) => filaIniciativa(i, ctx)).join('') || vacio('Todavía no formás parte de ningún equipo.');
    }
    const mias = IH.almacen.obtenerSolicitudes().filter((s) => s.usuarioId === usuario.id);
    return mias.map((s) => {
      const ini = IH.almacen.obtenerIniciativa(s.iniciativaId);
      return `<div class="fila-lista">
        <span>
          <span class="fw-semibold d-block">${U.escapar(ini?.titulo ?? s.iniciativaId)}</span>
          <span class="small text-body-secondary">${U.escapar(s.rol)} · ${U.escapar(ctx.competencias.get(s.competencia)?.nombre ?? s.competencia)} · ${U.formatearFecha(s.fecha)}</span>
        </span>
        ${U.badgeSolicitud(s.estado)}
      </div>`;
    }).join('') || vacio('No has enviado solicitudes.');
  }

  function contar(usuario) {
    const todas = IH.almacen.obtenerIniciativas();
    return {
      propias: todas.filter((i) => i.propietario === usuario.id).length,
      participo: todas.filter((i) => i.equipo.includes(usuario.id)).length,
      solicitudes: IH.almacen.obtenerSolicitudes().filter((s) => s.usuarioId === usuario.id).length
    };
  }

  function activarPestana(boton, usuario) {
    document.querySelectorAll('#pestanas [role="tab"]').forEach((b) => {
      const activo = b === boton;
      b.classList.toggle('active', activo);
      b.setAttribute('aria-selected', String(activo));
      b.tabIndex = activo ? 0 : -1;
    });
    const panel = $('contenido-pestanas');
    panel.setAttribute('aria-labelledby', boton.id);
    panel.innerHTML = renderPestana(boton.dataset.tab, usuario);
  }

  IH.ui.cargarPagina('../', () => {
    const usuario = IH.sesion.usuarioActual();
    if (!usuario) { $('sin-sesion').hidden = false; return; }

    $('perfil').hidden = false;
    renderTarjeta(usuario);
    Object.entries(contar(usuario)).forEach(([k, v]) => { $('n-' + k).textContent = v; });

    const pestanas = $('pestanas');
    activarPestana(pestanas.querySelector('[data-tab="propias"]'), usuario);

    pestanas.addEventListener('click', (e) => {
      const b = e.target.closest('[role="tab"]');
      if (b) activarPestana(b, usuario);
    });
    // Navegación por teclado entre pestañas con flechas.
    pestanas.addEventListener('keydown', (e) => {
      if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
      const tabs = [...pestanas.querySelectorAll('[role="tab"]')];
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      const siguiente = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      siguiente.focus();
      activarPestana(siguiente, usuario);
    });

    $('nota-local').hidden = !IH.almacen.hayCambiosLocales();
    $('restablecer').addEventListener('click', () => {
      IH.almacen.restablecer();
      U.toast('Datos de ejemplo restablecidos.', 'info');
      setTimeout(() => window.location.reload(), 700);
    });
  });
})();