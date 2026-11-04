import * as repo from '../repositories/iniciativas.repository.js';
import * as solicitudesRepo from '../repositories/solicitudes.repository.js';
import * as proyectosRepo from '../repositories/proyectos.repository.js';
import { mapasCatalogo } from '../repositories/catalogos.repository.js';
import { contextoIniciativas } from './contexto.service.js';
import { nivelDeAcceso, esPropietario, integrantes } from './reglas.js';
import { serializarIniciativa, serializarMiembro } from '../utils/serializadores.js';
import { ErrorApi } from '../utils/ErrorApi.js';

// Visibilidad verificada en el servidor antes de responder (RNF-05, RN-20).
export async function cargarVisible(id, usuario) {
  const ini = await repo.buscarPorId(id);
  const nivel = ini ? nivelDeAcceso(ini, usuario) : 'none';
  if (nivel === 'none') throw ErrorApi.noEncontrado('La iniciativa no existe.');
  if (nivel === 'login') throw ErrorApi.noAutenticado('Esta iniciativa es institucional: iniciá sesión para verla.');
  return { ini, nivel };
}

// RN-06 y RN-07: solo el propietario modifica, archiva o elimina.
export async function cargarPropia(id, usuario) {
  const { ini } = await cargarVisible(id, usuario);
  if (!esPropietario(ini, usuario)) throw ErrorApi.prohibido('Solo el propietario puede realizar esta acción.');
  return ini;
}

async function validarReferencias({ categoryId, requiredSkillIds }) {
  const { categorias, competencias } = await mapasCatalogo();
  const details = [];
  if (!categorias.has(categoryId)) details.push({ field: 'categoryId', message: 'La categoría no existe.' });
  if (requiredSkillIds.some((s) => !competencias.has(s))) details.push({ field: 'requiredSkillIds', message: 'Alguna competencia no existe.' });
  if (details.length) throw ErrorApi.validacion(details);
}

export async function detalle(ini, usuario) {
  const ctx = await contextoIniciativas([ini], usuario);
  return serializarIniciativa(ini, ctx, usuario, { detalle: true });
}

export async function listar(q, usuario) {
  if ((q.owner === 'me' || q.member === 'me') && !usuario) throw ErrorApi.noAutenticado();
  const pagina = await repo.listar(q, usuario);
  const ctx = await contextoIniciativas(pagina.items, usuario);
  return { ...pagina, items: pagina.items.map((i) => serializarIniciativa(i, ctx, usuario)) };
}

export async function obtener(id, usuario) {
  const { ini } = await cargarVisible(id, usuario);
  return detalle(ini, usuario);
}

export async function crear(datos, usuario) {
  await validarReferencias(datos);
  // RN-02 y RN-03: el propietario es siempre el usuario autenticado, nunca un dato del cuerpo.
  const ini = await repo.crear({ ...datos, ownerId: usuario.id, members: [], status: 'published' });
  return detalle(ini, usuario);
}

export async function actualizar(id, datos, usuario) {
  const ini = await cargarPropia(id, usuario);
  if (ini.status === 'archived') throw ErrorApi.conflicto('ARCHIVED', 'Una iniciativa archivada no se puede modificar.');
  if (datos.estimatedMembers < integrantes(ini)) {
    throw ErrorApi.conflicto('PARTICIPANTS_BELOW_TEAM', `El equipo ya tiene ${integrantes(ini)} integrantes, incluido el propietario.`);
  }
  await validarReferencias(datos);
  return detalle(await repo.actualizar(id, datos), usuario);
}

// RN-08 y RN-09: se elimina solo si no hay información relacionada.
export async function eliminar(id, usuario) {
  const ini = await cargarPropia(id, usuario);
  const [solicitudes, proyecto] = await Promise.all([solicitudesRepo.contarDeIniciativa(ini._id), proyectosRepo.buscarPorIniciativa(ini._id)]);
  if (ini.members.length > 0 || solicitudes > 0 || proyecto) {
    throw ErrorApi.conflicto('HAS_RELATED_DATA', 'La iniciativa tiene equipo, solicitudes o proyecto: archivala en lugar de eliminarla.');
  }
  await repo.eliminar(id);
}

export async function archivar(id, usuario) {
  const ini = await cargarPropia(id, usuario);
  if (ini.status === 'archived') throw ErrorApi.conflicto('ARCHIVED', 'La iniciativa ya está archivada.');
  return detalle(await repo.actualizar(id, { status: 'archived' }), usuario);
}

export async function listarMiembros(id, q, usuario) {
  const { ini, nivel } = await cargarVisible(id, usuario);
  if (nivel !== 'full') throw ErrorApi.prohibido('No tenés acceso al equipo de esta iniciativa.');
  const ctx = await contextoIniciativas([ini], usuario);
  let miembros = ini.members;
  if (q.role) miembros = miembros.filter((m) => m.roleId === q.role);
  if (q.skill) miembros = miembros.filter((m) => ctx.usuarios.get(String(m.userId))?.skills?.some((s) => s.skillId === q.skill));
  return miembros.map((m) => serializarMiembro(m, ctx));
}

export async function retirarMiembro(id, userId, usuario) {
  const ini = await cargarPropia(id, usuario);
  if (String(ini.ownerId) === userId) throw ErrorApi.conflicto('CANNOT_REMOVE_OWNER', 'El propietario no puede retirarse del equipo.');
  const retirado = await repo.quitarMiembro(id, userId);
  if (!retirado) throw ErrorApi.noEncontrado('Esa persona no es miembro del equipo.');
}