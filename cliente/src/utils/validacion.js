// Cada regla devuelve null si el valor es válido o un mensaje específico si no.
export const LIMITES = {
  title: [5, 80], summary: [10, 160], description: [20, 2000], problem: [10, 1000],
  beneficiaries: [5, 500], message: [15, 300], name: [5, 80], objective: [10, 300], bio: [0, 500],
};

export const REGEX_ETIQUETA = /^[\p{L}\p{N}][\p{L}\p{N}\- ]{1,29}$/u;
export const REGEX_DISPONIBILIDAD = /^\d{1,2}\s?h\/semana$/i;
export const REGEX_GITHUB = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;
export const REGEX_URL = /^https?:\/\/\S+$/;
export const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const vacio = (v) => v === undefined || v === null || String(v).trim() === '' || (Array.isArray(v) && v.length === 0);

export const requerido = (v) => (vacio(v) ? 'Este campo es obligatorio.' : null);

export const longitud = (min, max) => (v) => {
  const n = String(v ?? '').trim().length;
  if (min && n < min) return `Debe tener al menos ${min} caracteres (faltan ${min - n}).`;
  if (max && n > max) return `No debe superar los ${max} caracteres.`;
  return null;
};

export const rango = (min, max) => (v) => {
  if (vacio(v)) return 'Este campo es obligatorio.';
  const n = Number(v);
  if (!Number.isInteger(n)) return 'Debe ser un número entero.';
  return n < min || n > max ? `Debe estar entre ${min} y ${max}.` : null;
};

export const seleccionValida = (permitidos) => (v) => {
  if (vacio(v)) return 'Elegí una opción.';
  return permitidos.includes(v) ? null : 'Elegí una opción válida.';
};

export const formato = (regex, mensaje) => (v) => (vacio(v) || regex.test(String(v).trim()) ? null : mensaje);

export const cantidad = (min, max) => (lista = []) => {
  if (lista.length < min) return `Agregá al menos ${min}.`;
  if (max && lista.length > max) return `Podés agregar como máximo ${max}.`;
  return null;
};

// Ejecuta reglas en orden y devuelve el primer error.
export const combinar = (...reglas) => (v, todos) => {
  for (const regla of reglas) {
    const mensaje = regla(v, todos);
    if (mensaje) return mensaje;
  }
  return null;
};

// La regla solo se aplica si el campo tiene valor.
export const opcional = (regla) => (v, todos) => (vacio(v) ? null : regla(v, todos));