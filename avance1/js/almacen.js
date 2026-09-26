window.IH = window.IH || {};

IH.almacen = (function () {
  let estado = { iniciativas: [], categorias: [], competencias: [], usuarios: [], solicitudes: [] };
  const mapas = {};

  function inicializar(datos) {
    estado = datos;
    mapas.categorias = new Map(datos.categorias.map((c) => [c.id, c]));
    mapas.competencias = new Map(datos.competencias.map((c) => [c.id, c]));
    mapas.usuarios = new Map(datos.usuarios.map((u) => [u.id, u]));
  }

  function obtenerIniciativas() { return estado.iniciativas; }
  function obtenerIniciativa(id) { return estado.iniciativas.find((i) => i.id === id); }
  function obtenerSolicitudes() { return estado.solicitudes; }
  function obtenerUsuario(id) { return mapas.usuarios.get(id); }
  function contexto() { return { categorias: mapas.categorias, competencias: mapas.competencias, usuarios: mapas.usuarios }; }

  function actualizarIniciativa(id, cambios) {
    estado.iniciativas = estado.iniciativas.map((i) => (i.id === id ? { ...i, ...cambios } : i));
  }

  function agregarIniciativa(ini) {
    estado.iniciativas = [...estado.iniciativas, ini];
  }

  function eliminarOArchivar(id) {
    const ini = obtenerIniciativa(id);
    const tieneRelacion = ini.equipo.length > 0 || estado.solicitudes.some((s) => s.iniciativaId === id);
    if (tieneRelacion) {
      actualizarIniciativa(id, { estado: 'archivada' });
      return 'archivada';
    }
    estado.iniciativas = estado.iniciativas.filter((i) => i.id !== id);
    return 'eliminada';
  }

  function agregarSolicitud(solicitud) {
    estado.solicitudes = [...estado.solicitudes, solicitud];
  }

  return {
    inicializar, obtenerIniciativas, obtenerIniciativa, obtenerSolicitudes, obtenerUsuario,
    contexto, actualizarIniciativa, agregarIniciativa, eliminarOArchivar, agregarSolicitud
  };
})();