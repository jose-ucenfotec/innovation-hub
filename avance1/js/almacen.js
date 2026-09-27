window.IH = window.IH || {};

// Estado en memoria. Los JSON son el modelo principal para este avance; localStorage solo
// conserva altas, cambios y solicitudes entre páginas dentro del prototipo para visualización.
IH.almacen = (function () {
  const CLAVE = 'ih.datos.v1';
  let estado = { iniciativas: [], categorias: [], competencias: [], usuarios: [], solicitudes: [] };
  const mapas = {};

  function hoy() { return new Date().toISOString().slice(0, 10); }

  function leerLocal() {
    try { return JSON.parse(localStorage.getItem(CLAVE)); } catch { return null; }
  }
  function guardar() {
    localStorage.setItem(CLAVE, JSON.stringify({ iniciativas: estado.iniciativas, solicitudes: estado.solicitudes }));
  }
  function hayCambiosLocales() { return localStorage.getItem(CLAVE) !== null; }
  function restablecer() { localStorage.removeItem(CLAVE); }

  function inicializar(datos) {
    const local = leerLocal();
    estado = {
      ...datos,
      iniciativas: local?.iniciativas ?? datos.iniciativas,
      solicitudes: local?.solicitudes ?? datos.solicitudes
    };
    mapas.categorias = new Map(estado.categorias.map((c) => [c.id, c]));
    mapas.competencias = new Map(estado.competencias.map((c) => [c.id, c]));
    mapas.usuarios = new Map(estado.usuarios.map((u) => [u.id, u]));
  }

  function obtenerIniciativas() { return estado.iniciativas; }
  function obtenerIniciativa(id) { return estado.iniciativas.find((i) => i.id === id); }
  function obtenerSolicitudes() { return estado.solicitudes; }
  function obtenerUsuario(id) { return mapas.usuarios.get(id); }
  function contexto() {
    return { categorias: mapas.categorias, competencias: mapas.competencias, usuarios: mapas.usuarios };
  }

  function actualizarIniciativa(id, cambios) {
    estado.iniciativas = estado.iniciativas.map((i) => (i.id === id ? { ...i, ...cambios, fechaModificacion: hoy() } : i));
    guardar();
  }

  function agregarIniciativa(datos) {
    const ini = { ...datos, fechaCreacion: hoy(), fechaModificacion: hoy() };
    estado.iniciativas = [...estado.iniciativas, ini];
    guardar();
    return ini;
  }

  // Información que RF-I-INI-04 pide mostrar antes de eliminar o archivar.
  function relaciones(id) {
    const ini = obtenerIniciativa(id);
    return {
      miembros: ini?.equipo.length ?? 0,
      solicitudes: estado.solicitudes.filter((s) => s.iniciativaId === id).length,
      tieneProyecto: ini?.estado === 'proyecto'
    };
  }

  function eliminarOArchivar(id) {
    const r = relaciones(id);
    if (r.miembros > 0 || r.solicitudes > 0 || r.tieneProyecto) {
      actualizarIniciativa(id, { estado: 'archivada' });
      return 'archivada';
    }
    estado.iniciativas = estado.iniciativas.filter((i) => i.id !== id);
    guardar();
    return 'eliminada';
  }

  function agregarSolicitud(solicitud) {
    estado.solicitudes = [...estado.solicitudes, solicitud];
    guardar();
  }

  return {
    inicializar, obtenerIniciativas, obtenerIniciativa, obtenerSolicitudes, obtenerUsuario, contexto,
    actualizarIniciativa, agregarIniciativa, relaciones, eliminarOArchivar, agregarSolicitud,
    hayCambiosLocales, restablecer
  };
})();