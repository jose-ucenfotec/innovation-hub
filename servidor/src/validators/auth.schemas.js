import { z } from 'zod';
import { TIPOS_MIEMBRO } from '../models/enums.js';
import { opcion } from './comunes.js';

const obligatorio = { required_error: 'Este campo es obligatorio.', invalid_type_error: 'Debe ser texto.' };
export const nombre = z.string(obligatorio).trim().min(2, 'Debe tener al menos 2 caracteres.').max(60, 'No debe superar los 60 caracteres.');
const correo = z.string(obligatorio).trim().toLowerCase().max(120, 'No debe superar los 120 caracteres.').email('Ingresá un correo válido.');

export const cuerpoRegistro = z.object({
  firstName: nombre,
  lastName: nombre,
  secondLastName: nombre.nullable().optional(),
  email: correo,
  password: z.string(obligatorio).min(8, 'Debe tener al menos 8 caracteres.').max(72, 'No debe superar los 72 caracteres.')
    .regex(/[A-Za-zÁÉÍÓÚáéíóúÑñ]/, 'Debe incluir al menos una letra.').regex(/\d/, 'Debe incluir al menos un número.'),
  confirmPassword: z.string(obligatorio),
  memberType: opcion(TIPOS_MIEMBRO),
  career: nombre,
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'Debés aceptar los términos de uso.' }) }),
}).refine((d) => d.password === d.confirmPassword, { message: 'Las contraseñas no coinciden.', path: ['confirmPassword'] });

export const cuerpoLogin = z.object({
  email: correo,
  password: z.string(obligatorio).min(1, 'Este campo es obligatorio.'),
});