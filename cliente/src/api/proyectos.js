import { solicitar } from './cliente.js';

export const listarProyectos = (params, signal) => solicitar('GET', '/projects', { params, signal });
export const obtenerProyecto = (id, signal) => solicitar('GET', `/projects/${encodeURIComponent(id)}`, { signal });