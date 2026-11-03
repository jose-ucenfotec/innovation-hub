import { solicitar } from './cliente.js';

export const obtenerPerfilPropio = (signal) => solicitar('GET', '/auth/me', { signal });
export const actualizarPerfil = (datos) => solicitar('PUT', '/users/me', { cuerpo: datos });
export const buscarUsuarios = (params, signal) => solicitar('GET', '/users', { params, signal });
export const obtenerUsuario = (id, signal) => solicitar('GET', `/users/${encodeURIComponent(id)}`, { signal });