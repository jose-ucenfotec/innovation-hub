// Reglas de negocio puras. Luego se mueven a BD
const mismoId = (a, b) => a != null && b != null && String(a) === String(b);

export const ESTADOS_QUE_RECIBEN = ['published', 'forming'];

export const esPropietario = (ini, usuario) => !!usuario && mismoId(ini.ownerId, usuario.id);
export const esMiembro = (ini, usuario) => !!usuario && ini.members.some((m) => mismoId(m.userId, usuario.id));

// RN-16: el propietario cuenta como integrante sin solicitud.
export const integrantes = (ini) => ini.members.length + 1;
export const espaciosDisponibles = (ini) => Math.max(0, ini.estimatedMembers - integrantes(ini));

// RN-20 y los cuatro niveles de visibilidad.
// 'full' ve todo · 'summary' solo resumen · 'login' debe autenticarse · 'none' no existe para él
export function nivelDeAcceso(ini, usuario) {
  if (esPropietario(ini, usuario) || esMiembro(ini, usuario)) return 'full';
  if (ini.visibility === 'public') return 'full';
  if (ini.visibility === 'institutional') return usuario ? 'full' : 'login';
  if (ini.visibility === 'restricted') return 'summary';
  return 'none';
}

const conflicto = (code, message) => ({ status: 409, code, message });

// Orden fijo. Primero quién es, luego el estado, luego el cupo, luego duplicados.
// Así una iniciativa convertida en proyecto nunca dice "sin cupo".
export function verificarSolicitud(ini, usuario, pendientesDelUsuario) {
  if (esPropietario(ini, usuario)) return conflicto('SELF_REQUEST', 'No podés solicitar participación en tu propia iniciativa.');
  if (esMiembro(ini, usuario)) return conflicto('ALREADY_MEMBER', 'Ya formás parte del equipo de esta iniciativa.');
  if (!ESTADOS_QUE_RECIBEN.includes(ini.status)) return conflicto('INITIATIVE_CLOSED', 'Esta iniciativa ya no recibe solicitudes.');
  if (espaciosDisponibles(ini) === 0) return conflicto('NO_SPOTS', 'La iniciativa ya completó los espacios previstos.');
  if (pendientesDelUsuario > 0) return conflicto('DUPLICATE_PENDING', 'Ya tenés una solicitud pendiente para esta iniciativa.');
  return null;
}

// RN-17 y RN-18.
export function verificarConversion(ini) {
  if (ini.status === 'project') return conflicto('ALREADY_PROJECT', 'Esta iniciativa ya se convirtió en proyecto.');
  if (ini.status === 'archived') return conflicto('ARCHIVED', 'Una iniciativa archivada no puede convertirse en proyecto.');
  if (ini.members.length < 1) return conflicto('NO_MEMBERS', 'Se necesita al menos un integrante además del propietario.');
  return null;
}

// Competencias que el usuario puede ofrecer. Las que pide la iniciativa y él tiene.
export function competenciasOfrecibles(ini, usuario) {
  const propias = new Set(usuario.skills.map((s) => String(s.skillId)));
  return ini.requiredSkillIds.map(String).filter((id) => propias.has(id));
}