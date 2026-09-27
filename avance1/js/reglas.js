window.IH = window.IH || {};

IH.reglas = (function () {
  function esPropietario(ini, usuario) {
    return !!usuario && ini.propietario === usuario.id;
  }
  function esMiembro(ini, usuario) {
    return !!usuario && ini.equipo.includes(usuario.id);
  }

  // RN-20: toda consulta respeta la visibilidad. Propietario y equipo siempre ven todo.
  function nivelDeAcceso(ini, usuario) {
    if (esPropietario(ini, usuario) || esMiembro(ini, usuario)) return 'completo';
    switch (ini.visibilidad) {
      case 'pública': return 'completo';
      case 'institucional': return usuario ? 'completo' : 'bloqueado';
      case 'restringida': return 'resumen';
      case 'privada': return 'bloqueado';
      default: return 'bloqueado';
    }
  }

  // Las privadas no aparecen en el catálogo general salvo para propietario y equipo.
  function visibleEnCatalogo(ini, usuario) {
    return ini.visibilidad !== 'privada' || esPropietario(ini, usuario) || esMiembro(ini, usuario);
  }

  // RN-16.
  function espaciosDisponibles(ini) {
    return Math.max(0, ini.participantesEstimados - ini.equipo.length - 1);
  }

  // RN-10, RN-11, RN-15
  function puedeSolicitar(ini, usuario, solicitudes) {
    if (!usuario) return { ok: false, motivo: 'Elegí un usuario en "Ver como" para simular la sesión y poder solicitar participación.' };
    if (esPropietario(ini, usuario)) return { ok: false, motivo: 'No podés solicitar participación en tu propia iniciativa.' };
    if (esMiembro(ini, usuario)) return { ok: false, motivo: 'Ya formás parte del equipo de esta iniciativa.' };
    if (['archivada', 'proyecto'].includes(ini.estado)) return { ok: false, motivo: 'Esta iniciativa ya no recibe solicitudes.' };
    if (espaciosDisponibles(ini) === 0) return { ok: false, motivo: 'La iniciativa ya completó los espacios previstos.' };
    const yaPendiente = solicitudes.some(
      (s) => s.iniciativaId === ini.id && s.usuarioId === usuario.id && s.estado === 'pendiente'
    );
    if (yaPendiente) return { ok: false, motivo: 'Ya tenés una solicitud pendiente para esta iniciativa.' };
    return { ok: true, motivo: '' };
  }

  // RN-17, RN-18
  function puedeConvertirseEnProyecto(ini) {
    return ini.equipo.length >= 1 && !['proyecto', 'archivada'].includes(ini.estado);
  }

  // RF-A-INI-03
  function puedeEditarse(ini) {
    return ini.estado !== 'archivada';
  }

  return { esPropietario, esMiembro, nivelDeAcceso, visibleEnCatalogo, espaciosDisponibles, puedeSolicitar, puedeConvertirseEnProyecto, puedeEditarse };
})();