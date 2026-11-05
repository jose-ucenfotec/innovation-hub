import { solicitar } from './cliente.js';

export const registrar = (datos) => solicitar('POST', '/auth/register', { cuerpo: datos });
export const iniciarSesion = (credenciales) => solicitar('POST', '/auth/login', { cuerpo: credenciales });
export const cerrarSesion = () => solicitar('POST', '/auth/logout');