window.IH = window.IH || {};

// Simulación de sesión para el Avance 1. No hay autenticación real.
IH.sesion = (function () {
  const CLAVE = 'ih.sesion';
  const POR_DEFECTO = 'u1';

  function idActual() {
    return localStorage.getItem(CLAVE) ?? POR_DEFECTO;
  }

  function usuarioActual() {
    const id = idActual();
    if (id === 'visitante') return null;
    return IH.almacen.obtenerUsuario(id) ?? null;
  }

  function cambiar(id) {
    localStorage.setItem(CLAVE, id || 'visitante');
    window.location.reload();
  }

  return { idActual, usuarioActual, cambiar };
})();