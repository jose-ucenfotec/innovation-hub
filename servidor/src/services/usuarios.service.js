import * as repo from '../repositories/usuarios.repository.js';
import { mapasCatalogo } from '../repositories/catalogos.repository.js';
import { serializarUsuarioPropio, serializarUsuarioPublico } from '../utils/serializadores.js';
import { ErrorApi } from '../utils/ErrorApi.js';

export async function perfilPropio(usuario) {
  return serializarUsuarioPropio(usuario, await mapasCatalogo());
}

export async function buscar(q) {
  const [pagina, ctx] = await Promise.all([repo.buscar(q), mapasCatalogo()]);
  return { ...pagina, items: pagina.items.map((u) => serializarUsuarioPublico(u, ctx)) };
}

export async function obtener(id) {
  const usuario = await repo.buscarActivoPorId(id);
  if (!usuario) throw ErrorApi.noEncontrado('La persona no existe.');
  return serializarUsuarioPublico(usuario, await mapasCatalogo());
}

export async function actualizarPerfil(usuario, { email, ...cambios }) {
  // El correo es el identificador de la cuenta: no se modifica desde el perfil.
  if (email !== undefined && email.trim().toLowerCase() !== usuario.email) {
    throw ErrorApi.validacion([{ field: 'email', message: 'El correo no se puede modificar desde el perfil.' }]);
  }
  const ctx = await mapasCatalogo();
  if (cambios.skills?.some((s) => !ctx.competencias.has(s.skillId))) {
    throw ErrorApi.validacion([{ field: 'skills', message: 'Alguna competencia no existe.' }]);
  }
  return serializarUsuarioPropio(await repo.actualizar(usuario.id, cambios), ctx);
}