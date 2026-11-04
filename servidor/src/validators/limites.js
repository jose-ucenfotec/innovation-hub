export const LIMITES = {
  title: [5, 80], summary: [10, 160], description: [20, 2000], problem: [10, 1000],
  beneficiaries: [5, 500], message: [15, 300], name: [5, 80], objective: [10, 300], bio: [0, 500],
};
export const REGEX_ETIQUETA = /^[\p{L}\p{N}][\p{L}\p{N}\- ]{1,29}$/u;
export const REGEX_DISPONIBILIDAD = /^\d{1,2}\s?h\/semana$/i;
export const REGEX_GITHUB = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;
export const REGEX_FECHA = /^\d{4}-\d{2}-\d{2}$/;