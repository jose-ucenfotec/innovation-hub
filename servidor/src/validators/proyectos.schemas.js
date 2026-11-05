import { z } from 'zod';
import { ESTADOS_PROYECTO } from '../models/enums.js';
import { REGEX_FECHA, REGEX_GITHUB } from './limites.js';
import { opcion, paginacion, sinRepetidos, texto } from './comunes.js';

export const cuerpoProyecto = z.object({
  name: texto('name'),
  objective: texto('objective'),
  description: texto('description'),
  technologies: z.array(z.string().trim().min(1).max(40, 'Cada tecnología admite hasta 40 caracteres.'))
    .max(10, 'Podés agregar como máximo 10.').refine(sinRepetidos, 'No repitas tecnologías.').default([]),
  startDate: z.string({ required_error: 'Este campo es obligatorio.' }).regex(REGEX_FECHA, 'Usá el formato AAAA-MM-DD.'),
  estimatedEndDate: z.string().regex(REGEX_FECHA, 'Usá el formato AAAA-MM-DD.').nullable().default(null),
  repositoryUrl: z.string().trim().regex(REGEX_GITHUB, 'Usá el formato https://github.com/usuario/repositorio.').nullable().default(null),
}).refine((p) => !p.estimatedEndDate || p.estimatedEndDate >= p.startDate, {
  message: 'Debe ser igual o posterior a la fecha de inicio.', path: ['estimatedEndDate'],
});

export const consultaProyectos = z.object({ ...paginacion, status: opcion(ESTADOS_PROYECTO).optional() });