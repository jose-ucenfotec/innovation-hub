// Credencial que acompaña cada petición.
const CLAVE = 'ih.devUser';

export const obtenerUsuarioDev = () => sessionStorage.getItem(CLAVE) || '';

export function fijarUsuarioDev(id) {
  if (id) sessionStorage.setItem(CLAVE, id);
  else sessionStorage.removeItem(CLAVE);
}

export function cabecerasAuth() {
  const id = obtenerUsuarioDev();
  return id ? { 'X-Dev-User': id } : {};
}