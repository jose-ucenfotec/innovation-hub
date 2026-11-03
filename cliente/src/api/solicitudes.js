import { solicitar } from './cliente.js';

const ruta = (id) => `/requests/${encodeURIComponent(id)}`;

export const listarMisSolicitudes = (params, signal) => solicitar('GET', '/requests/mine', { params, signal });
export const listarSolicitudesRecibidas = (params, signal) => solicitar('GET', '/requests/received', { params, signal });
export const obtenerSolicitud = (id, signal) => solicitar('GET', ruta(id), { signal });
export const actualizarSolicitud = (id, datos) => solicitar('PUT', ruta(id), { cuerpo: datos });
export const cancelarSolicitud = (id) => solicitar('POST', `${ruta(id)}/cancel`);
export const decidirSolicitud = (id, decision, comment) => solicitar('POST', `${ruta(id)}/decision`, { cuerpo: { decision, comment } });