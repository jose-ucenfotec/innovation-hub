// Error de negocio con código HTTP y código de contrato. El manejador central lo convierte en JSON.
export class ErrorApi extends Error {
  constructor(status, code, message, details = []) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static validacion(details, message = 'Hay datos inválidos.') { return new ErrorApi(400, 'VALIDATION_ERROR', message, details); }
  static noAutenticado(message = 'Necesitás iniciar sesión.') { return new ErrorApi(401, 'UNAUTHORIZED', message); }
  static prohibido(message = 'No tenés permiso para realizar esta acción.') { return new ErrorApi(403, 'FORBIDDEN', message); }
  static noEncontrado(message = 'El recurso no existe.') { return new ErrorApi(404, 'NOT_FOUND', message); }
  static conflicto(code, message) { return new ErrorApi(409, code, message); }
}