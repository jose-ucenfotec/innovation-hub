window.IH = window.IH || {};

IH.reglas = (function () {
  // Niveles de acceso
  function nivelDeAcceso(iniciativa, usuarioActual) {
    if (iniciativa.visibilidad === 'pública') return 'completo';
    if (iniciativa.visibilidad === 'institucional') return usuarioActual ? 'completo' : 'bloqueado';
    if (iniciativa.visibilidad === 'restringida') return 'resumen';
    if (iniciativa.visibilidad === 'privada') {
      const esPropietario = usuarioActual && iniciativa.propietario === usuarioActual.id;
      const esMiembro = usuarioActual && iniciativa.equipo.includes(usuarioActual.id);
      return (esPropietario || esMiembro) ? 'completo' : 'bloqueado';
    }
    return 'bloqueado';
  }

  // Propietario de la iniciativa
  function esPropietario(iniciativa, usuarioActual) {
    return !!usuarioActual && iniciativa.propietario === usuarioActual.id;
  }

  // Solicitudes de participación
  function puedeSolicitar(iniciativa, usuarioActual, solicitudes) {
    if (!usuarioActual) return { ok: false, motivo: 'Iniciá sesión para solicitar participación.' };
    if (iniciativa.propietario === usuarioActual.id) {
      return { ok: false, motivo: 'No podés solicitar participación en tu propia iniciativa.' };
    }
    const yaPendiente = solicitudes.some(
      (s) => s.iniciativaId === iniciativa.id && s.usuarioId === usuarioActual.id && s.estado === 'pendiente'
    );
    if (yaPendiente) return { ok: false, motivo: 'Ya tenés una solicitud pendiente para esta iniciativa.' };
    return { ok: true, motivo: '' };
  }

  // Verificar si la iniciativa puede convertirse en proyecto
  function puedeConvertirseEnProyecto(iniciativa) {
    return iniciativa.equipo.length >= 1;
  }

  return { nivelDeAcceso, esPropietario, puedeSolicitar, puedeConvertirseEnProyecto };
})();