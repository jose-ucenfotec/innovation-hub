// El token vive en sessionStorage: se pierde al cerrar la pestaña.
const CLAVE = 'ih.token';

export const obtenerToken = () => sessionStorage.getItem(CLAVE);
export const guardarToken = (token) => sessionStorage.setItem(CLAVE, token);
export const borrarToken = () => sessionStorage.removeItem(CLAVE);

export function cabecerasAuth() {
  const token = obtenerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}