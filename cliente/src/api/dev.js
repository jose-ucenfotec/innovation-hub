import { solicitar } from './cliente.js';

export const listarUsuariosDev = (signal) => solicitar('GET', '/dev/users', { signal });