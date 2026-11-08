// validators/proyectos.schemas.js
// Cuerpo para convertir una iniciativa en proyecto y filtros de GET /projects.
// Cada función devuelve { errores, datos }.

import { ESTADOS_PROYECTO } from '../models/enums.js';
import { REGEX_FECHA, REGEX_GITHUB } from './limites.js';
import { OBLIGATORIO, falta, limpiar, sinRepetidos, revisarTexto, revisarPaginacion, revisarFiltroOpcion } from './comunes.js';

export function cuerpoProyecto(body) {
  const errores = {};

  for (const campo of ['name', 'objective', 'description']) {
    const mensaje = revisarTexto(body[campo], campo);
    if (mensaje) errores[campo] = mensaje;
  }

  // Tecnologías: opcionales, hasta 10, sin repetir.
  const tecnologias = body.technologies ?? [];
  if (!Array.isArray(tecnologias)) errores.technologies = 'Debe ser una lista.';
  else if (tecnologias.length > 10) errores.technologies = 'Podés agregar como máximo 10.';
  else if (!tecnologias.every((t) => typeof t === 'string' && t.trim().length >= 1 && t.trim().length <= 40)) {
    errores.technologies = 'Cada tecnología admite hasta 40 caracteres.';
  } else if (!sinRepetidos(tecnologias.map((t) => t.trim()))) errores.technologies = 'No repitas tecnologías.';

  if (falta(body.startDate)) errores.startDate = OBLIGATORIO;
  else if (typeof body.startDate !== 'string' || !REGEX_FECHA.test(body.startDate)) errores.startDate = 'Usá el formato AAAA-MM-DD.';

  const fin = body.estimatedEndDate ?? null;
  if (fin !== null && (typeof fin !== 'string' || !REGEX_FECHA.test(fin))) errores.estimatedEndDate = 'Usá el formato AAAA-MM-DD.';
  // Regla entre campos: solo si las dos fechas son válidas.
  else if (fin !== null && !errores.startDate && fin < body.startDate) errores.estimatedEndDate = 'Debe ser igual o posterior a la fecha de inicio.';

  const repositorio = limpiar(body.repositoryUrl) ?? null;
  if (repositorio !== null && (typeof repositorio !== 'string' || !REGEX_GITHUB.test(repositorio))) {
    errores.repositoryUrl = 'Usá el formato https://github.com/usuario/repositorio.';
  }

  const datos = {
    name: limpiar(body.name),
    objective: limpiar(body.objective),
    description: limpiar(body.description),
    technologies: Array.isArray(tecnologias) ? tecnologias.map(limpiar) : [],
    startDate: body.startDate,
    estimatedEndDate: fin,
    repositoryUrl: repositorio,
  };
  return { errores, datos };
}

export function consultaProyectos(query) {
  const errores = {};
  const datos = {
    ...revisarPaginacion(query, errores),
    status: revisarFiltroOpcion(query, 'status', ESTADOS_PROYECTO, errores),
  };
  return { errores, datos };
}