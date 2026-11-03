import { solicitar } from './cliente.js';

const ruta = (id) => `/initiatives/${encodeURIComponent(id)}`;

export const listarIniciativas = (params, signal) => solicitar('GET', '/initiatives', { params, signal });
export const obtenerIniciativa = (id, signal) => solicitar('GET', ruta(id), { signal });
export const crearIniciativa = (datos) => solicitar('POST', '/initiatives', { cuerpo: datos });
export const actualizarIniciativa = (id, datos) => solicitar('PUT', ruta(id), { cuerpo: datos });
export const eliminarIniciativa = (id) => solicitar('DELETE', ruta(id));
export const archivarIniciativa = (id) => solicitar('POST', `${ruta(id)}/archive`);
export const listarMiembros = (id, params, signal) => solicitar('GET', `${ruta(id)}/members`, { params, signal });
export const retirarMiembro = (id, userId) => solicitar('DELETE', `${ruta(id)}/members/${encodeURIComponent(userId)}`);
export const convertirEnProyecto = (id, datos) => solicitar('POST', `${ruta(id)}/project`, { cuerpo: datos });
export const crearSolicitud = (id, datos) => solicitar('POST', `${ruta(id)}/requests`, { cuerpo: datos });