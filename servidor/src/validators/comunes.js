import { z } from 'zod';
import { LIMITES } from './limites.js';

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Identificador inválido.');

export const texto = (campo) => {
  const [min, max] = LIMITES[campo];
  return z.string({ required_error: 'Este campo es obligatorio.', invalid_type_error: 'Debe ser texto.' })
    .trim()
    .min(min, `Debe tener al menos ${min} caracteres.`)
    .max(max, `No debe superar los ${max} caracteres.`);
};

export const opcion = (valores) => z.enum(valores, { errorMap: () => ({ message: 'Elegí una opción válida.' }) });

export const sinRepetidos = (lista) => new Set(lista).size === lista.length;

// page ≥ 1; size ≥ 1, tope 50; sort se valida contra la lista blanca en el repositorio.
export const paginacion = {
  page: z.coerce.number().int('Debe ser un número entero.').min(1, 'Debe ser 1 o mayor.').default(1),
  size: z.coerce.number().int('Debe ser un número entero.').min(1, 'Debe ser 1 o mayor.').default(12).transform((n) => Math.min(n, 50)),
  sort: z.string().max(30).optional(),
};