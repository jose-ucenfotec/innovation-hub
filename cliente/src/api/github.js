const BASE = import.meta.env.VITE_GITHUB_API_URL;

export class ErrorGithub extends Error {
  constructor(tipo, mensaje) {
    super(mensaje);
    this.tipo = tipo; // 'inexistente' | 'privado' | 'limite' | 'no-disponible' | 'invalida' | 'http'
  }
}

export function extraerRepositorio(url) {
  const m = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/.exec(url ?? '');
  return m ? { owner: m[1], repo: m[2] } : null;
}

export async function obtenerRepositorio(url, signal) {
  const partes = extraerRepositorio(url);
  if (!partes) throw new ErrorGithub('invalida', 'La dirección no tiene el formato https://github.com/usuario/repositorio.');

  let respuesta;
  try {
    respuesta = await fetch(`${BASE}/repos/${partes.owner}/${partes.repo}`, { headers: { Accept: 'application/vnd.github+json' }, signal });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ErrorGithub('no-disponible', 'No se pudo contactar a GitHub. Revisá la conexión o intentá más tarde.');
  }

  if (respuesta.status === 404) {
    throw new ErrorGithub('inexistente', 'El repositorio no existe o es privado. Sin credenciales, GitHub responde 404 en ambos casos.');
  }
  if ((respuesta.status === 403 || respuesta.status === 429) && respuesta.headers.get('x-ratelimit-remaining') === '0') {
    const reinicio = Number(respuesta.headers.get('x-ratelimit-reset')) * 1000;
    const hora = reinicio ? new Date(reinicio).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }) : 'más tarde';
    throw new ErrorGithub('limite', `Se alcanzó el límite de consultas a GitHub. Podés intentar de nuevo a las ${hora}.`);
  }
  if (respuesta.status === 401 || respuesta.status === 403) throw new ErrorGithub('privado', 'GitHub negó el acceso: el repositorio es privado o requiere permisos.');
  if (respuesta.status >= 500) throw new ErrorGithub('no-disponible', 'GitHub no está disponible en este momento.');
  if (!respuesta.ok) throw new ErrorGithub('http', `GitHub respondió con un error inesperado (${respuesta.status}).`);

  let datos;
  try {
    datos = await respuesta.json();
  } catch {
    throw new ErrorGithub('invalida', 'GitHub devolvió una respuesta que no se pudo interpretar.');
  }
  if (!datos || typeof datos.name !== 'string' || !datos.owner?.login) {
    throw new ErrorGithub('invalida', 'La respuesta de GitHub no tiene los datos esperados.');
  }
  if (datos.private) throw new ErrorGithub('privado', 'El repositorio es privado.');

  return {
    nombre: datos.name, propietario: datos.owner.login, descripcion: datos.description, lenguaje: datos.language,
    rama: datos.default_branch, actualizado: datos.pushed_at ?? datos.updated_at, issuesAbiertos: datos.open_issues_count,
    enlace: datos.html_url,
  };
}