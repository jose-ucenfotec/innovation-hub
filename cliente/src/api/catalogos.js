import { solicitar } from './cliente.js';

export const listarCategorias = (signal) => solicitar('GET', '/categories', { signal });
export const listarCompetencias = (signal) => solicitar('GET', '/skills', { signal });
export const listarRoles = (signal) => solicitar('GET', '/roles', { signal });