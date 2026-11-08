// validators/iniciativas.schemas.js
// Cuerpo de POST y PUT /initiatives, y filtros de GET /initiatives.
// Cada función devuelve { errores, datos }.

import { TIPOS, VISIBILIDADES, ESTADOS_INICIATIVA } from '../models/enums.js';
import { REGEX_ETIQUETA } from './limites.js';
import {
  OBLIGATORIO, OPCION_INVALIDA, REGEX_OBJECT_ID, falta, limpiar, sinRepetidos,
  revisarTexto, revisarPaginacion, revisarFiltro, revisarFiltroOpcion,
} from './comunes.js';

const TEXTOS = ['title', 'summary', 'description', 'problem', 'beneficiaries'];

export function cuerpoIniciativa(body) {
  const errores = {};

  for (const campo of TEXTOS) {
    const mensaje = revisarTexto(body[campo], campo);
    if (mensaje) errores[campo] = mensaje;
  }

  if (!TIPOS.includes(body.type)) errores.type = OPCION_INVALIDA;
  if (!VISIBILIDADES.includes(body.visibility)) errores.visibility = OPCION_INVALIDA;
  if (typeof body.categoryId !== 'string' || body.categoryId === '') errores.categoryId = 'Elegí una categoría.';

  const competencias = body.requiredSkillIds;
  if (!Array.isArray(competencias) || competencias.length === 0) errores.requiredSkillIds = 'Agregá al menos 1.';
  else if (competencias.length > 8) errores.requiredSkillIds = 'Podés agregar como máximo 8.';
  else if (!competencias.every((c) => typeof c === 'string')) errores.requiredSkillIds = OPCION_INVALIDA;
  else if (!sinRepetidos(competencias)) errores.requiredSkillIds = 'No repitas competencias.';

  const integrantes = body.estimatedMembers;
  if (falta(integrantes)) errores.estimatedMembers = OBLIGATORIO;
  else if (!Number.isInteger(integrantes)) errores.estimatedMembers = 'Debe ser un número entero.';
  else if (integrantes < 1 || integrantes > 20) errores.estimatedMembers = 'Debe estar entre 1 y 20.';

  // Las etiquetas son opcionales: si no vienen, la lista queda vacía.
  const etiquetas = body.tags ?? [];
  if (!Array.isArray(etiquetas)) errores.tags = 'Debe ser una lista.';
  else if (etiquetas.length > 5) errores.tags = 'Podés agregar como máximo 5.';
  else if (!etiquetas.every((e) => typeof e === 'string' && REGEX_ETIQUETA.test(e.trim()))) {
    errores.tags = 'Usá letras, números, espacios o guiones (2 a 30 caracteres).';
  } else if (!sinRepetidos(etiquetas.map((e) => e.trim()))) errores.tags = 'No repitas etiquetas.';

  // Se copia campo por campo: ownerId, status o members del cliente nunca llegan al servicio.
  const datos = {
    title: limpiar(body.title),
    type: body.type,
    summary: limpiar(body.summary),
    description: limpiar(body.description),
    problem: limpiar(body.problem),
    beneficiaries: limpiar(body.beneficiaries),
    categoryId: body.categoryId,
    requiredSkillIds: competencias,
    estimatedMembers: integrantes,
    visibility: body.visibility,
    tags: Array.isArray(etiquetas) ? etiquetas.map(limpiar) : [],
  };
  return { errores, datos };
}

export function consultaIniciativas(query) {
  const errores = {};
  const datos = {
    ...revisarPaginacion(query, errores),
    q: revisarFiltro(query, 'q', 100, errores),
    type: revisarFiltroOpcion(query, 'type', TIPOS, errores),
    category: revisarFiltro(query, 'category', 40, errores),
    skill: revisarFiltro(query, 'skill', 40, errores),
    status: revisarFiltroOpcion(query, 'status', ESTADOS_INICIATIVA, errores),
    hasSpots: revisarFiltroOpcion(query, 'hasSpots', ['true', 'false'], errores),
    member: revisarFiltroOpcion(query, 'member', ['me'], errores),
  };
  // owner acepta "me" o el id de una persona.
  if (query.owner !== undefined) {
    if (query.owner === 'me' || (typeof query.owner === 'string' && REGEX_OBJECT_ID.test(query.owner))) datos.owner = query.owner;
    else errores.owner = 'Identificador inválido.';
  }
  return { errores, datos };
}