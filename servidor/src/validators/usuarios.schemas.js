// validators/usuarios.schemas.js
// Edición del perfil propio (PUT /users/me) y búsqueda de personas (GET /users).
// Cada función devuelve { errores, datos }.

import { NIVELES } from '../models/enums.js';
import { limpiar, sinRepetidos, revisarPaginacion, revisarFiltro, revisarFiltroOpcion } from './comunes.js';
import { revisarNombre } from './auth.schemas.js';

const REGEX_URL = /^https?:\/\/\S+$/;

export function cuerpoPerfil(body) {
  const errores = {};
  const datos = {};

  // Obligatorios
  for (const campo of ['firstName', 'lastName', 'career']) {
    const mensaje = revisarNombre(body[campo]);
    if (mensaje) errores[campo] = mensaje;
    datos[campo] = limpiar(body[campo]);
  }

  // Opcionales: solo se revisan y se guardan si vienen en el cuerpo.
  if (body.secondLastName !== undefined) {
    if (body.secondLastName !== null) {
      const mensaje = revisarNombre(body.secondLastName);
      if (mensaje) errores.secondLastName = mensaje;
    }
    datos.secondLastName = limpiar(body.secondLastName);
  }

  if (body.bio !== undefined) {
    if (typeof body.bio !== 'string') errores.bio = 'Debe ser texto.';
    else if (body.bio.trim().length > 500) errores.bio = 'No debe superar los 500 caracteres.';
    datos.bio = limpiar(body.bio);
  }

  if (body.skills !== undefined) {
    const lista = body.skills;
    if (!Array.isArray(lista)) errores.skills = 'Debe ser una lista.';
    else if (lista.length > 15) errores.skills = 'Podés registrar como máximo 15.';
    else if (!lista.every((s) => typeof s?.skillId === 'string' && s.skillId !== '' && NIVELES.includes(s.level))) {
      errores.skills = 'Cada competencia necesita un nivel válido.';
    } else if (!sinRepetidos(lista.map((s) => s.skillId))) errores.skills = 'No repitas competencias.';
    else datos.skills = lista.map((s) => ({ skillId: s.skillId, level: s.level }));
  }

  if (body.interests !== undefined) {
    const lista = body.interests;
    if (!Array.isArray(lista)) errores.interests = 'Debe ser una lista.';
    else if (lista.length > 10) errores.interests = 'Podés agregar como máximo 10.';
    else if (!lista.every((i) => typeof i === 'string' && i.trim().length >= 2)) errores.interests = 'Cada interés necesita al menos 2 caracteres.';
    else if (!lista.every((i) => i.trim().length <= 30)) errores.interests = 'Cada interés admite hasta 30 caracteres.';
    else datos.interests = lista.map(limpiar);
  }

  if (body.availability !== undefined) {
    const horas = body.availability?.hoursPerWeek;
    const detalle = body.availability?.detail ?? '';
    if (!Number.isInteger(horas)) errores['availability.hoursPerWeek'] = 'Debe ser un número entero.';
    else if (horas < 0 || horas > 40) errores['availability.hoursPerWeek'] = 'Entre 0 y 40.';
    if (typeof detalle !== 'string' || detalle.trim().length > 100) errores['availability.detail'] = 'No debe superar los 100 caracteres.';
    datos.availability = { hoursPerWeek: horas, detail: limpiar(detalle) };
  }

  if (body.portfolioUrl !== undefined) {
    const url = limpiar(body.portfolioUrl);
    if (url !== null && (typeof url !== 'string' || url.length > 200 || !REGEX_URL.test(url))) {
      errores.portfolioUrl = 'Ingresá una URL que empiece con http:// o https://.';
    }
    datos.portfolioUrl = url;
  }

  // El correo se acepta solo para que el servicio lo rechace con un mensaje claro si cambia.
  if (typeof body.email === 'string') datos.email = body.email;

  return { errores, datos };
}

export function consultaUsuarios(query) {
  const errores = {};
  const datos = {
    ...revisarPaginacion(query, errores),
    q: revisarFiltro(query, 'q', 60, errores),
    skill: revisarFiltro(query, 'skill', 40, errores),
    career: revisarFiltro(query, 'career', 60, errores),
    available: revisarFiltroOpcion(query, 'available', ['true', 'false'], errores),
  };
  return { errores, datos };
}