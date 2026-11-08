// validators/auth.schemas.js
// Registro e inicio de sesión. Cada función devuelve { errores, datos }:
// errores trae un mensaje por campo ({} si todo está bien) y datos solo los campos permitidos, limpios.

import { TIPOS_MIEMBRO } from '../models/enums.js';
import { OBLIGATORIO, OPCION_INVALIDA, falta, limpiar, revisarLargo } from './comunes.js';

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Nombre, apellidos y carrera: de 2 a 60 caracteres.
export const revisarNombre = (valor) => revisarLargo(valor, 2, 60);

function revisarCorreo(valor) {
  if (falta(valor)) return OBLIGATORIO;
  if (typeof valor !== 'string') return 'Debe ser texto.';
  if (valor.trim().length > 120) return 'No debe superar los 120 caracteres.';
  if (!REGEX_CORREO.test(valor.trim())) return 'Ingresá un correo válido.';
  return null;
}

// El correo se guarda y se busca siempre en minúsculas.
const limpiarCorreo = (valor) => (typeof valor === 'string' ? valor.trim().toLowerCase() : valor);

function revisarClave(clave) {
  if (falta(clave)) return OBLIGATORIO;
  if (typeof clave !== 'string') return 'Debe ser texto.';
  if (clave.length < 8) return 'Debe tener al menos 8 caracteres.';
  if (clave.length > 72) return 'No debe superar los 72 caracteres.';
  if (!/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(clave)) return 'Debe incluir al menos una letra.';
  if (!/\d/.test(clave)) return 'Debe incluir al menos un número.';
  return null;
}

export function cuerpoRegistro(body) {
  const errores = {};

  for (const campo of ['firstName', 'lastName', 'career']) {
    const mensaje = revisarNombre(body[campo]);
    if (mensaje) errores[campo] = mensaje;
  }
  // El segundo apellido es opcional: si viene, cumple la misma regla que el primero.
  if (!falta(body.secondLastName)) {
    const mensaje = revisarNombre(body.secondLastName);
    if (mensaje) errores.secondLastName = mensaje;
  }

  const mensajeCorreo = revisarCorreo(body.email);
  if (mensajeCorreo) errores.email = mensajeCorreo;

  const mensajeClave = revisarClave(body.password);
  if (mensajeClave) errores.password = mensajeClave;
  if (typeof body.confirmPassword !== 'string') errores.confirmPassword = OBLIGATORIO;
  else if (!mensajeClave && body.confirmPassword !== body.password) errores.confirmPassword = 'Las contraseñas no coinciden.';

  if (!TIPOS_MIEMBRO.includes(body.memberType)) errores.memberType = OPCION_INVALIDA;
  if (body.acceptTerms !== true) errores.acceptTerms = 'Debés aceptar los términos de uso.';

  // confirmPassword y acceptTerms solo se revisan: no se guardan.
  const datos = {
    firstName: limpiar(body.firstName),
    lastName: limpiar(body.lastName),
    secondLastName: limpiar(body.secondLastName) ?? null,
    email: limpiarCorreo(body.email),
    password: body.password,
    memberType: body.memberType,
    career: limpiar(body.career),
  };
  return { errores, datos };
}

export function cuerpoLogin(body) {
  const errores = {};
  const mensajeCorreo = revisarCorreo(body.email);
  if (mensajeCorreo) errores.email = mensajeCorreo;
  if (typeof body.password !== 'string' || body.password === '') errores.password = OBLIGATORIO;

  return { errores, datos: { email: limpiarCorreo(body.email), password: body.password } };
}