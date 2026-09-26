window.IH = window.IH || {};

IH.ui = (function () {
  function escapar(texto) {
    return String(texto).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  const COLOR_TIPO = { idea: 'primary', necesidad: 'success', reto: 'warning' };

  function badgeTipo(tipo) {
    return `<span class="badge text-bg-${COLOR_TIPO[tipo] || 'secondary'}">${escapar(tipo)}</span>`;
  }

  function badgeEstado(estado) {
    const color = { abierta: 'light', proyecto: 'info', archivada: 'secondary' }[estado] || 'light';
    return `<span class="badge text-bg-${color} border">${escapar(estado)}</span>`;
  }

  function tarjetaIniciativa(ini, ctx) {
    const categoria = ctx.categorias.get(ini.categoria)?.nombre ?? 'Sin categoría';
    const autor = ctx.usuarios.get(ini.propietario)?.nombre ?? 'Desconocido';
    const competencias = ini.competencias
      .map((id) => ctx.competencias.get(id)?.nombre ?? id)
      .slice(0, 3)
      .map((n) => `<li class="list-inline-item badge text-bg-light border">${escapar(n)}</li>`)
      .join('');
    return `<article class="card h-100 tarjeta-iniciativa" data-id="${ini.id}">
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <h3 class="card-title h6 mb-0">${escapar(ini.titulo)}</h3>
          ${badgeTipo(ini.tipo)}
        </div>
        <p class="card-text small text-body-secondary mt-2">${escapar(ini.resumen)}</p>
        <ul class="list-inline small mb-2">${competencias}</ul>
        <p class="small mb-3">${escapar(categoria)} · ${escapar(autor)} · ${badgeEstado(ini.estado)}</p>
        <a class="btn btn-outline-primary btn-sm mt-auto" href="detalle.html?id=${encodeURIComponent(ini.id)}">Ver detalle</a>
      </div>
    </article>`;
  }

  function renderNavbar(paginaActual, base) {
    const enlaces = [
      ['index.html', 'Inicio'],
      ['paginas/catalogo.html', 'Iniciativas'],
      ['paginas/perfil.html', 'Mi perfil']
    ];
    const items = enlaces.map(([href, texto]) => {
      const activo = href.endsWith(paginaActual);
      return `<li class="nav-item"><a class="nav-link${activo ? ' active' : ''}" ${activo ? 'aria-current="page"' : ''} href="${base}${href}">${texto}</a></li>`;
    }).join('');
    return `<nav class="navbar navbar-expand-md bg-body-tertiary border-bottom">
      <div class="container">
        <a class="navbar-brand" href="${base}index.html">Innovation Hub</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navPrincipal" aria-controls="navPrincipal" aria-expanded="false" aria-label="Mostrar u ocultar la navegación">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navPrincipal">
          <ul class="navbar-nav me-auto">${items}</ul>
          <a class="btn btn-primary btn-sm" href="${base}paginas/formulario.html">Publicar iniciativa</a>
        </div>
      </div>
    </nav>`;
  }

  return { escapar, badgeTipo, badgeEstado, tarjetaIniciativa, renderNavbar };
})();