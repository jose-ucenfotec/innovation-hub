import { z } from 'zod';
import { ESTADOS_SOLICITUD } from '../models/enums.js';
import { REGEX_DISPONIBILIDAD, REGEX_FECHA } from './limites.js';
import { objectId, opcion, paginacion, texto } from './comunes.js';

export const cuerpoSolicitud = z.object({
  message: texto('message'),
  offeredSkillId: z.string({ required_error: 'Elegí una competencia.' }).min(1, 'Elegí una competencia.'),
  roleId: z.string({ required_error: 'Elegí un rol.' }).min(1, 'Elegí un rol.'),
  availability: z.string({ required_error: 'Este campo es obligatorio.' }).trim()
    .regex(REGEX_DISPONIBILIDAD, 'Usá el formato "N h/semana", por ejemplo 4 h/semana.'),
});

export const cuerpoDecision = z.object({
  decision: z.enum(['accepted', 'rejected'], { errorMap: () => ({ message: 'La decisión debe ser accepted o rejected.' }) }),
  comment: z.string().trim().max(300, 'No debe superar los 300 caracteres.').optional(),
});

const fecha = z.string().regex(REGEX_FECHA, 'Usá el formato AAAA-MM-DD.');

export const consultaMias = z.object({ ...paginacion, status: opcion(ESTADOS_SOLICITUD).optional() });

export const consultaRecibidas = z.object({
  ...paginacion,
  initiativeId: objectId.optional(),
  status: opcion(ESTADOS_SOLICITUD).optional(),
  skill: z.string().max(40).optional(),
  role: z.string().max(40).optional(),
  from: fecha.optional(),
  to: fecha.optional(),
}).refine((q) => !q.from || !q.to || q.from <= q.to, { message: 'La fecha inicial no puede ser posterior a la final.', path: ['from'] });