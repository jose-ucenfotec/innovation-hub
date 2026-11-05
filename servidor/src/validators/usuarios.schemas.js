import { z } from 'zod';
import { NIVELES } from '../models/enums.js';
import { opcion, paginacion, sinRepetidos } from './comunes.js';
import { nombre } from './auth.schemas.js';

export const cuerpoPerfil = z.object({
  firstName: nombre,
  lastName: nombre,
  secondLastName: nombre.nullable().optional(),
  career: nombre,
  bio: z.string().trim().max(500, 'No debe superar los 500 caracteres.').optional(),
  skills: z.array(z.object({ skillId: z.string().min(1), level: opcion(NIVELES) }))
    .max(15, 'Podés registrar como máximo 15.')
    .refine((lista) => sinRepetidos(lista.map((s) => s.skillId)), 'No repitas competencias.').optional(),
  interests: z.array(z.string().trim().min(2, 'Cada interés necesita al menos 2 caracteres.').max(30)).max(10, 'Podés agregar como máximo 10.').optional(),
  availability: z.object({
    hoursPerWeek: z.number({ invalid_type_error: 'Debe ser un número entero.' }).int().min(0, 'Entre 0 y 40.').max(40, 'Entre 0 y 40.'),
    detail: z.string().trim().max(100).default(''),
  }).optional(),
  portfolioUrl: z.string().trim().max(200).regex(/^https?:\/\/\S+$/, 'Ingresá una URL que empiece con http:// o https://.').nullable().optional(),
  email: z.string().optional(), // se acepta solo para rechazarlo con un mensaje claro si cambia
});

export const consultaUsuarios = z.object({
  ...paginacion,
  q: z.string().trim().max(60).optional(),
  skill: z.string().max(40).optional(),
  career: z.string().trim().max(60).optional(),
  available: z.enum(['true', 'false']).optional(),
});