window.IH = window.IH || {};

IH.ui = (function () {
  let rutaBase = '';

  function escapar(texto) {
    return String(texto ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  const ETIQUETAS = {
    tipo: { idea: 'Idea', necesidad: 'Necesidad', reto: 'Reto' },
    estado: {
      borrador: 'Borrador', publicada: 'Publicada', en_formacion: 'En formación de equipo',
      proyecto: 'Convertida en proyecto', archivada: 'Archivada'
    },
    visibilidad: { 'pública': 'Pública', institucional: 'Institucional', restringida: 'Restringida', privada: 'Privada' },
    nivel: { basico: 'básico', intermedio: 'intermedio', avanzado: 'avanzado' },
    solicitud: { pendiente: 'Pendiente', aceptada: 'Aceptada', rechazada: 'Rechazada', cancelada: 'Cancelada' },
    tipoMiembro: { estudiante: 'Estudiante', docente: 'Docente', administrativo: 'Administrativo' }
  };

  const ICONOS = {
    tipo: { idea: 'bi-lightbulb-fill', necesidad: 'bi-life-preserver', reto: 'bi-flag-fill' },
    estado: {
      borrador: 'bi-pencil-square', publicada: 'bi-broadcast', en_formacion: 'bi-people-fill',
      proyecto: 'bi-rocket-takeoff-fill', archivada: 'bi-archive'
    },
    visibilidad: { 'pública': 'bi-globe2', institucional: 'bi-building', restringida: 'bi-eye-slash', privada: 'bi-lock-fill' },
    solicitud: { pendiente: 'bi-hourglass-split', aceptada: 'bi-check-circle-fill', rechazada: 'bi-x-circle-fill', cancelada: 'bi-slash-circle' },
    tipoMiembro: { estudiante: 'bi-mortarboard', docente: 'bi-easel', administrativo: 'bi-briefcase' }
  };

  const COLOR = {
    tipo: { idea: 'primary', necesidad: 'success', reto: 'warning' },
    estado: { borrador: 'light', publicada: 'light', en_formacion: 'light', proyecto: 'info', archivada: 'secondary' },
    solicitud: { pendiente: 'warning', aceptada: 'success', rechazada: 'danger', cancelada: 'secondary' }
  };

  function icono(clase) {
    return `<i class="bi ${escapar(clase)}" aria-hidden="true"></i>`;
  }
  function iconoDe(grupo, clave) {
    return ICONOS[grupo]?.[clave] ?? 'bi-tag';
  }
  function etiqueta(grupo, clave) {
    return ETIQUETAS[grupo]?.[clave] ?? clave;
  }

  function badge(grupo, clave) {
    const color = COLOR[grupo]?.[clave] ?? 'light';
    const borde = color === 'light' ? ' border' : '';
    return `<span class="badge text-bg-${color}${borde}">${icono(iconoDe(grupo, clave))} ${escapar(etiqueta(grupo, clave))}</span>`;
  }
  function badgeTipo(tipo) { return badge('tipo', tipo); }
  function badgeEstado(estado) { return badge('estado', estado); }
  function badgeSolicitud(estado) { return badge('solicitud', estado); }
  function badgeVisibilidad(visibilidad) {
    return `<span class="chip">${icono(iconoDe('visibilidad', visibilidad))} ${escapar(etiqueta('visibilidad', visibilidad))}</span>`;
  }

  function chip(texto, opciones = {}) {
    const clases = 'chip' + (opciones.neutro ? ' chip--neutro' : '');
    const ic = opciones.icono ? icono(opciones.icono) + ' ' : '';
    const nivel = opciones.nivel ? ` <span class="chip--nivel">· ${escapar(etiqueta('nivel', opciones.nivel))}</span>` : '';
    return `<span class="${clases}">${ic}${escapar(texto)}${nivel}</span>`;
  }

  function iniciales(nombre) {
    return nombre.split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  }

  // Sin imágenes de perfil: iniciales sobre un círculo de color.
  function avatar(usuario, grande = false) {
    const clase = 'avatar' + (grande ? ' avatar--lg' : '');
    if (!usuario) return `<span class="${clase}" aria-hidden="true">?</span>`;
    return `<span class="${clase}" role="img" aria-label="${escapar(usuario.nombre)}">${escapar(iniciales(usuario.nombre))}</span>`;
  }

  function formatearFecha(iso) {
    if (!iso) return 'sin fecha';
    return new Date(iso + 'T00:00:00').toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function tarjetaIniciativa(ini, ctx) {
    const categoria = ctx.categorias.get(ini.categoria);
    const autor = ctx.usuarios.get(ini.propietario)?.nombre ?? 'Desconocido';
    const espacios = Math.max(0, ini.participantesEstimados - ini.equipo.length - 1);
    const competencias = ini.competencias.slice(0, 3)
      .map((id) => `<li>${chip(ctx.competencias.get(id)?.nombre ?? id)}</li>`).join('');
    return `<article class="card h-100 tarjeta-iniciativa tarjeta-iniciativa--${escapar(ini.tipo)}">
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <h2 class="card-title mb-0">${escapar(ini.titulo)}</h2>
          ${badgeTipo(ini.tipo)}
        </div>
        <p class="card-text small text-body-secondary mt-2">${escapar(ini.resumen)}</p>
        <ul class="lista-chips mb-3">${competencias}</ul>
        <p class="small mb-1">${icono(categoria?.icono ?? 'bi-tag')} ${escapar(categoria?.nombre ?? 'Sin categoría')} · ${icono('bi-person')} ${escapar(autor)}</p>
        <p class="small mb-3 d-flex flex-wrap gap-2 align-items-center">
          ${badgeEstado(ini.estado)}
          <span class="text-body-secondary">${icono('bi-person-plus')} ${ini.equipo.length + 1} ${ini.equipo.length + 1 === 1 ? 'integrante' : 'integrantes'} · ${espacios} ${espacios === 1 ? 'espacio' : 'espacios'}</span>
        </p>
        <a class="btn btn-outline-primary btn-sm mt-auto align-self-start" href="${rutaBase}paginas/detalle.html?id=${encodeURIComponent(ini.id)}">Ver detalle ${icono('bi-arrow-right')}</a>
      </div>
    </article>`;
  }

  function renderNavbar(paginaActual) {
    const enlaces = [
      ['index.html', 'Inicio', 'bi-house'],
      ['paginas/catalogo.html', 'Iniciativas', 'bi-grid-3x3-gap'],
      ['paginas/perfil.html', 'Mi perfil', 'bi-person-circle']
    ];
    const items = enlaces.map(([href, texto, ic]) => {
      const activo = href.endsWith(paginaActual);
      return `<li class="nav-item"><a class="nav-link${activo ? ' active' : ''}"${activo ? ' aria-current="page"' : ''} href="${rutaBase}${href}">${icono(ic)} ${texto}</a></li>`;
    }).join('');
    return `<nav class="navbar navbar-expand-md" aria-label="Navegación principal">
      <div class="container">
        <a class="navbar-brand" href="${rutaBase}index.html">
          <img src="${rutaBase}img/logo.svg" alt="" width="28" height="28"><span>Innovation Hub</span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navPrincipal" aria-controls="navPrincipal" aria-expanded="false" aria-label="Mostrar u ocultar la navegación">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navPrincipal">
          <ul class="navbar-nav me-auto mb-2 mb-md-0">${items}</ul>
          <div class="d-flex flex-column flex-md-row align-items-md-center gap-2">
            <label class="ver-como mb-0" for="ver-como">${icono('bi-person-badge')} Ver como
              <select id="ver-como" class="form-select form-select-sm"><option value="visitante">Visitante</option></select>
            </label>
            <a class="btn btn-primary btn-sm" href="${rutaBase}paginas/formulario.html">${icono('bi-plus-circle-fill')} Publicar iniciativa</a>
          </div>
        </div>
      </div>
    </nav>`;
  }

  function montarNavbar(paginaActual, base = '') {
    rutaBase = base;
    document.getElementById('navbar').innerHTML = renderNavbar(paginaActual);
    document.getElementById('ver-como').addEventListener('change', (e) => IH.sesion.cambiar(e.target.value));
  }

  function actualizarVerComo(usuarios) {
    const sel = document.getElementById('ver-como');
    if (!sel) return;
    sel.innerHTML = '<option value="visitante">Visitante</option>' +
      usuarios.map((u) => `<option value="${escapar(u.id)}">${escapar(u.nombre)}</option>`).join('');
    sel.value = IH.sesion.idActual();
    if (sel.selectedIndex < 0) sel.value = 'visitante';
  }

  function toast(mensaje, tipo = 'success') {
    let cont = document.getElementById('toasts');
    if (!cont) {
      cont = document.createElement('div');
      cont.id = 'toasts';
      cont.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(cont);
    }
    const textoOscuro = ['success', 'warning', 'light'].includes(tipo);
    const el = document.createElement('div');
    el.className = `toast align-items-center text-bg-${tipo} border-0`;
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML = `<div class="d-flex">
      <div class="toast-body">${mensaje}</div>
      <button type="button" class="btn-close ${textoOscuro ? '' : 'btn-close-white'} me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
    </div>`;
    cont.appendChild(el);
    el.addEventListener('hidden.bs.toast', () => el.remove());
    bootstrap.Toast.getOrCreateInstance(el, { delay: 4500 }).show();
  }

  const MENSAJES_URL = {
    creada: ['Iniciativa publicada.', 'success'],
    editada: ['Cambios guardados.', 'success'],
    eliminada: ['Iniciativa eliminada.', 'secondary'],
    archivada: ['La iniciativa tenía equipo o solicitudes: se archivó en lugar de eliminarse.', 'info'],
    solicitud: ['Solicitud enviada. Queda pendiente hasta que el propietario la resuelva.', 'success']
  };

  function mostrarMensajeDeUrl() {
    const params = new URLSearchParams(window.location.search);
    const clave = params.get('msg');
    if (!clave || !MENSAJES_URL[clave]) return;
    toast(...MENSAJES_URL[clave]);
    params.delete('msg');
    const consulta = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (consulta ? '?' + consulta : ''));
  }

  async function cargarPagina(base, alCargar) {
    const cargando = document.getElementById('cargando');
    const error = document.getElementById('error');
    try {
      const datos = await IH.datos.cargarDatos(base + 'datos/');
      IH.almacen.inicializar(datos);
      actualizarVerComo(datos.usuarios);
      if (cargando) cargando.hidden = true;
      await alCargar(datos);
    } catch (e) {
      console.error(e);
      if (cargando) cargando.hidden = true;
      if (!error) return;
      const esArchivo = window.location.protocol === 'file:';
      error.hidden = false;
      error.innerHTML = `
        <img src="${base}img/error-carga.svg" alt="" width="220" height="160" class="mb-3">
        <h2 class="h5">No se pudieron cargar los datos</h2>
        <p class="text-body-secondary mb-3">${esArchivo
          ? 'El navegador bloquea la lectura de archivos JSON cuando la página se abre directamente desde el disco. Abrí el proyecto en VS Code, hacé clic derecho sobre <code>avance1/index.html</code> y elegí <strong>Open with Live Server</strong>.'
          : 'Ocurrió un error al leer los archivos JSON. Recargá la página para volver a intentar.'}</p>
        <button type="button" class="btn btn-outline-primary btn-sm" onclick="window.location.reload()">${icono('bi-arrow-clockwise')} Reintentar</button>`;
    }
  }

  return {
    escapar, icono, iconoDe, etiqueta, badgeTipo, badgeEstado, badgeSolicitud, badgeVisibilidad,
    chip, avatar, formatearFecha, tarjetaIniciativa, montarNavbar, actualizarVerComo,
    toast, mostrarMensajeDeUrl, cargarPagina
  };
})();