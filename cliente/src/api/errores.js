// Error uniforme de la API. Mismo formato que { error: { code, message, details } }.
export class ErrorApi extends Error {
  constructor(status, code, message, details = []) {
    super(message);
    this.name = 'ErrorApi';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}