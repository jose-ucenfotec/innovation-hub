// validators/solicitudes.schemas.js
// Cuerpo de una solicitud, la decisión del propietario y los filtros de los dos listados.
// Cada función devuelve { errores, datos }.

import { ESTADOS_SOLICITUD } from '../models/enums.js';
import { REGEX_DISPONIBILIDAD, REGEX_FECHA } from './limites.js';
import { OBLIGATORIO, REGEX_OBJECT_ID, falta, limpiar, revisarTexto, revisarPaginacion, revisarFiltro, revisarFiltroOpcion } from './comunes.js';

export function cuerpoSolicitud(body) {
  const errores = {};

  const mensaje = revisarTexto(body.message, 'message');
  if (mensaje) errores.message = mensaje;
  if (typeof body.offeredSkillId !== 'string' || body.offeredSkillId === '') errores.offeredSkillId = 'Elegí una competencia.';
  if (typeof body.roleId !== 'string' || body.roleId === '') errores.roleId = 'Elegí un rol.';

  if (falta(body.availability)) errores.availability = OBLIGATORIO;
  else if (typeof body.availability !== 'string' || !REGEX_DISPONIBILIDAD.test(body.availability.trim())) {
    errores.availability = 'Usá el formato "N h/semana", por ejemplo 4 h/semana.';
  }

  const datos = {
    message: limpiar(body.message),
    offeredSkillId: body.offeredSkillId,
    roleId: body.roleId,
    availability: limpiar(body.availability),
  };
  return { errores, datos };
}

export function cuerpoDecision(body) {
  const errores = {};
  if (!['accepted', 'rejected'].includes(body.decision)) errores.decision = 'La decisión debe ser accepted o rejected.';

  const datos = { decision: body.decision };
  if (body.comment !== undefined) {
    if (typeof body.comment !== 'string' || body.comment.trim().length > 300) errores.comment = 'No debe superar los 300 caracteres.';
    datos.comment = limpiar(body.comment);
  }
  return { errores, datos };
}

export function consultaMias(query) {
  const errores = {};
  const datos = {
    ...revisarPaginacion(query, errores),
    status: revisarFiltroOpcion(query, 'status', ESTADOS_SOLICITUD, errores),
  };
  return { errores, datos };
}

// Fecha opcional en formato AAAA-MM-DD.
function revisarFecha(query, campo, errores) {
  const valor = query[campo];
  if (valor === undefined) return undefined;
  if (typeof valor !== 'string' || !REGEX_FECHA.test(valor)) {
    errores[campo] = 'Usá el formato AAAA-MM-DD.';
    return undefined;
  }
  return valor;
}

export function consultaRecibidas(query) {
  const errores = {};
  const datos = {
    ...revisarPaginacion(query, errores),
    status: revisarFiltroOpcion(query, 'status', ESTADOS_SOLICITUD, errores),
    skill: revisarFiltro(query, 'skill', 40, errores),
    role: revisarFiltro(query, 'role', 40, errores),
    from: revisarFecha(query, 'from', errores),
    to: revisarFecha(query, 'to', errores),
  };
  if (query.initiativeId !== undefined) {
    if (typeof query.initiativeId === 'string' && REGEX_OBJECT_ID.test(query.initiativeId)) datos.initiativeId = query.initiativeId;
    else errores.initiativeId = 'Identificador inválido.';
  }
  // Regla entre campos: solo si las dos fechas son válidas.
  if (datos.from && datos.to && datos.from > datos.to) errores.from = 'La fecha inicial no puede ser posterior a la final.';
  return { errores, datos };
}