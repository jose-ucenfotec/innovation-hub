import { ErrorApi } from './errores.js';
import { cabecerasAuth, obtenerToken, borrarToken } from './sesion.js';

const BASE = import.meta.env.VITE_API_URL;

function construirQuery(params) {
  if (!params) return '';
  const definidos = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  return definidos.length ? `?${new URLSearchParams(definidos)}` : '';
}

export async function solicitar(metodo, ruta, { cuerpo, params, signal } = {}) {
  const url = ruta + construirQuery(params);

  let respuesta;
  try {
    respuesta = await fetch(BASE + url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json', ...cabecerasAuth() },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ErrorApi(0, 'NETWORK_ERROR', 'No hay conexión con el servidor.');
  }

  if (respuesta.status === 204) return null;
  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    if (respuesta.status === 401 && obtenerToken()) {
      borrarToken();
      window.dispatchEvent(new Event('ih:sesion-expirada'));
    }
    const e = datos?.error;
    throw new ErrorApi(respuesta.status, e?.code ?? 'UNKNOWN_ERROR', e?.message ?? 'Ocurrió un error inesperado.', e?.details ?? []);
  }
  return datos;
}