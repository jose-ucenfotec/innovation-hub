// middleware/validar.js
// Corre la función de validación de cada parte de la petición (query o body).
// Si alguna devolvió errores, responde 400 con un mensaje por campo; si no, deja los datos limpios
// en req.validado para el controlador.

import { ErrorApi } from '../utils/ErrorApi.js';

export const validar = (validadores) => (req, _res, next) => {
  req.validado = {};
  const errores = {};

  for (const parte of ['query', 'body']) {
    if (!validadores[parte]) continue;
    const resultado = validadores[parte](req[parte] ?? {});
    req.validado[parte] = resultado.datos;
    Object.assign(errores, resultado.errores);
  }

  if (Object.keys(errores).length > 0) {
    // De { title: 'Debe tener…' } al formato del contrato: [{ field: 'title', message: 'Debe tener…' }]
    const details = Object.entries(errores).map(([field, message]) => ({ field, message }));
    throw ErrorApi.validacion(details);
  }
  next();
};