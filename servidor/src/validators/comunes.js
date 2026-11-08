// validators/comunes.js
// Revisiones que usan todos los validadores. Cada "revisar" devuelve el mensaje de error,
// o null si el valor está bien (igual que en series.validacion.js del lab).

import { LIMITES } from './limites.js';

export const OBLIGATORIO = 'Este campo es obligatorio.';
export const OPCION_INVALIDA = 'Elegí una opción válida.';
export const REGEX_OBJECT_ID = /^[a-f\d]{24}$/i;

export const falta = (valor) => valor === undefined || valor === null;
export const limpiar = (valor) => (typeof valor === 'string' ? valor.trim() : valor);
export const sinRepetidos = (lista) => new Set(lista).size === lista.length;

// Texto obligatorio entre min y max caracteres (sin contar espacios al inicio y al final).
export function revisarLargo(valor, min, max) {
  if (falta(valor)) return OBLIGATORIO;
  if (typeof valor !== 'string') return 'Debe ser texto.';
  const largo = valor.trim().length;
  if (largo < min) return `Debe tener al menos ${min} caracteres.`;
  if (largo > max) return `No debe superar los ${max} caracteres.`;
  return null;
}

// Campos con largo definido en limites.js: title, summary, message, name…
export const revisarTexto = (valor, campo) => revisarLargo(valor, LIMITES[campo][0], LIMITES[campo][1]);

// ── Query string (?page=2&type=idea…): todo llega como texto ──

// page ≥ 1 (1 por defecto); size ≥ 1 (12 por defecto, tope 50). sort se revisa en el repositorio.
export function revisarPaginacion(query, errores) {
  const page = query.page === undefined ? 1 : Number(query.page);
  const size = query.size === undefined ? 12 : Number(query.size);
  if (!Number.isInteger(page)) errores.page = 'Debe ser un número entero.';
  else if (page < 1) errores.page = 'Debe ser 1 o mayor.';
  if (!Number.isInteger(size)) errores.size = 'Debe ser un número entero.';
  else if (size < 1) errores.size = 'Debe ser 1 o mayor.';
  const sort = typeof query.sort === 'string' ? query.sort : undefined;
  return { page, size: Math.min(size, 50), sort };
}

// Filtro de texto opcional (?q=, ?skill=…). Devuelve el texto limpio o undefined.
export function revisarFiltro(query, campo, max, errores) {
  const valor = query[campo];
  if (valor === undefined) return undefined;
  if (typeof valor !== 'string' || valor.trim().length > max) {
    errores[campo] = `Debe ser un texto de hasta ${max} caracteres.`;
    return undefined;
  }
  return valor.trim();
}

// Filtro opcional con valores fijos (?type=idea, ?status=pending…).
export function revisarFiltroOpcion(query, campo, opciones, errores) {
  const valor = query[campo];
  if (valor === undefined) return undefined;
  if (!opciones.includes(valor)) {
    errores[campo] = OPCION_INVALIDA;
    return undefined;
  }
  return valor;
}