import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { ErrorApi } from '../utils/ErrorApi.js';

function conflictoPorDuplicado(err) {
  const campos = Object.keys(err.keyPattern ?? {});
  if (campos.includes('email')) return ErrorApi.conflicto('EMAIL_TAKEN', 'Ya existe una cuenta con ese correo.');
  if (campos.includes('userId')) return ErrorApi.conflicto('DUPLICATE_PENDING', 'Ya tenés una solicitud pendiente para esta iniciativa.');
  if (campos.includes('initiativeId')) return ErrorApi.conflicto('ALREADY_PROJECT', 'Esta iniciativa ya se convirtió en proyecto.');
  return ErrorApi.conflicto('CONFLICT', 'El recurso ya existe.');
}

// Último middleware: todo error termina aquí con el formato único del contrato.
// Nunca se envían trazas ni mensajes de MongoDB al cliente.
export function manejadorErrores(err, req, res, _next) {
  let error = err;
  if (err instanceof ZodError) {
    error = ErrorApi.validacion(err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })));
  } else if (err?.type === 'entity.parse.failed') {
    error = ErrorApi.validacion([], 'El cuerpo de la petición no es JSON válido.');
  } else if (err?.type === 'entity.too.large') {
    error = ErrorApi.validacion([], 'El cuerpo de la petición es demasiado grande.');
  } else if (err instanceof mongoose.Error.CastError) {
    error = ErrorApi.noEncontrado();
  } else if (err?.code === 11000) {
    error = conflictoPorDuplicado(err);
  }

  if (!(error instanceof ErrorApi)) {
    console.error(err);
    error = new ErrorApi(500, 'INTERNAL_ERROR', 'Ocurrió un error inesperado.');
  }
  res.status(error.status).json({ error: { code: error.code, message: error.message, details: error.details } });
}