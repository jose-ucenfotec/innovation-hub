import { z } from 'zod';
import { TIPOS, VISIBILIDADES, ESTADOS_INICIATIVA } from '../models/enums.js';
import { REGEX_ETIQUETA } from './limites.js';
import { objectId, opcion, paginacion, sinRepetidos, texto } from './comunes.js';

export const cuerpoIniciativa = z.object({
  title: texto('title'),
  type: opcion(TIPOS),
  summary: texto('summary'),
  description: texto('description'),
  problem: texto('problem'),
  beneficiaries: texto('beneficiaries'),
  categoryId: z.string({ required_error: 'Elegí una categoría.' }).min(1, 'Elegí una categoría.'),
  requiredSkillIds: z.array(z.string(), { required_error: 'Agregá al menos 1.' })
    .min(1, 'Agregá al menos 1.').max(8, 'Podés agregar como máximo 8.')
    .refine(sinRepetidos, 'No repitas competencias.'),
  estimatedMembers: z.number({ required_error: 'Este campo es obligatorio.', invalid_type_error: 'Debe ser un número entero.' })
    .int('Debe ser un número entero.').min(1, 'Debe estar entre 1 y 20.').max(20, 'Debe estar entre 1 y 20.'),
  visibility: opcion(VISIBILIDADES),
  tags: z.array(z.string().trim().regex(REGEX_ETIQUETA, 'Usá letras, números, espacios o guiones (2 a 30 caracteres).'))
    .max(5, 'Podés agregar como máximo 5.').refine(sinRepetidos, 'No repitas etiquetas.').default([]),
});

export const consultaIniciativas = z.object({
  ...paginacion,
  q: z.string().trim().max(100).optional(),
  type: opcion(TIPOS).optional(),
  category: z.string().max(40).optional(),
  skill: z.string().max(40).optional(),
  status: opcion(ESTADOS_INICIATIVA).optional(),
  hasSpots: z.enum(['true', 'false']).optional(),
  owner: z.union([z.literal('me'), objectId]).optional(),
  member: z.literal('me').optional(),
});

export const consultaMiembros = z.object({
  skill: z.string().max(40).optional(),
  role: z.string().max(40).optional(),
});