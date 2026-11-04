import { ErrorApi } from '../utils/ErrorApi.js';

export function noEncontrado(req, _res, next) {
  next(ErrorApi.noEncontrado(`La ruta ${req.method} ${req.originalUrl} no existe.`));
}