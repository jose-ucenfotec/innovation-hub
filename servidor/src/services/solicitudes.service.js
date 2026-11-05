import * as repo from '../repositories/solicitudes.repository.js';
import * as iniciativasRepo from '../repositories/iniciativas.repository.js';
import * as usuariosRepo from '../repositories/usuarios.repository.js';
import { mapasCatalogo } from '../repositories/catalogos.repository.js';
import { cargarVisible } from './iniciativas.service.js';
import { competenciasOfrecibles, esPropietario, verificarSolicitud } from './reglas.js';
import { serializarSolicitud } from '../utils/serializadores.js';
import { ErrorApi } from '../utils/ErrorApi.js';

async function contextoSolicitudes(solicitudes) {
  const idsIni = [...new Set(solicitudes.map((s) => String(s.initiativeId)))];
  const idsUsuarios = [...new Set(solicitudes.map((s) => String(s.userId)))];
  const [catalogo, iniciativas, usuarios] = await Promise.all([
    mapasCatalogo(), iniciativasRepo.buscarVarias(idsIni), usuariosRepo.mapaPorIds(idsUsuarios),
  ]);
  return { ...catalogo, usuarios, iniciativas: new Map(iniciativas.map((i) => [String(i._id), i])) };
}

const serializarVarias = async (lista) => {
  const ctx = await contextoSolicitudes(lista);
  return lista.map((s) => serializarSolicitud(s, ctx));
};
const serializarUna = async (s) => (await serializarVarias([s]))[0];

// La competencia debe ser requerida por la iniciativa y estar en el perfil; el rol debe existir.
async function validarContenido(cuerpo, ini, usuario) {
  const { roles } = await mapasCatalogo();
  const details = [];
  if (!competenciasOfrecibles(ini, usuario).includes(cuerpo.offeredSkillId)) {
    details.push({ field: 'offeredSkillId', message: 'Elegí una competencia que la iniciativa requiera y que tengas en tu perfil.' });
  }
  if (!roles.has(cuerpo.roleId)) details.push({ field: 'roleId', message: 'Elegí un rol válido.' });
  if (details.length) throw ErrorApi.validacion(details);
}

export async function crear(idIniciativa, cuerpo, usuario) {
  const { ini } = await cargarVisible(idIniciativa, usuario);
  const pendientes = await repo.contarPendientes(ini._id, usuario.id);
  const regla = verificarSolicitud(ini, usuario, pendientes);
  if (regla) throw ErrorApi.conflicto(regla.code, regla.message);
  await validarContenido(cuerpo, ini, usuario);
  const solicitud = await repo.crear({ ...cuerpo, initiativeId: ini._id, userId: usuario.id, status: 'pending' });
  return serializarUna(solicitud);
}

export async function mias(q, usuario) {
  const pagina = await repo.listarDeUsuario(usuario.id, q);
  return { ...pagina, items: await serializarVarias(pagina.items) };
}

export async function recibidas(q, usuario) {
  const propias = await iniciativasRepo.idsDePropietario(usuario.id);
  const pagina = await repo.listarRecibidas(propias, q);
  return { ...pagina, items: await serializarVarias(pagina.items) };
}

async function cargar(id, usuario) {
  const solicitud = await repo.buscarPorId(id);
  if (!solicitud) throw ErrorApi.noEncontrado('La solicitud no existe.');
  const ini = await iniciativasRepo.buscarPorId(solicitud.initiativeId);
  return { solicitud, ini, esSolicitante: String(solicitud.userId) === usuario.id, esDueno: Boolean(ini) && esPropietario(ini, usuario) };
}

export async function obtener(id, usuario) {
  const { solicitud, esSolicitante, esDueno } = await cargar(id, usuario);
  if (!esSolicitante && !esDueno) throw ErrorApi.prohibido('No tenés acceso a esta solicitud.');
  return serializarUna(solicitud);
}

async function cargarPropiaPendiente(id, usuario) {
  const datos = await cargar(id, usuario);
  if (!datos.esSolicitante) throw ErrorApi.prohibido('Solo quien envió la solicitud puede modificarla.');
  if (datos.solicitud.status !== 'pending') throw ErrorApi.conflicto('NOT_PENDING', 'Solo las solicitudes pendientes pueden modificarse.'); // RN-12
  return datos;
}

export async function actualizar(id, cuerpo, usuario) {
  const { ini } = await cargarPropiaPendiente(id, usuario);
  await validarContenido(cuerpo, ini, usuario);
  const actualizada = await repo.actualizarSiPendiente(id, cuerpo);
  if (!actualizada) throw ErrorApi.conflicto('NOT_PENDING', 'Solo las solicitudes pendientes pueden modificarse.');
  return serializarUna(actualizada);
}

export async function cancelar(id, usuario) {
  await cargarPropiaPendiente(id, usuario); // RN-13
  const cancelada = await repo.actualizarSiPendiente(id, { status: 'cancelled' });
  if (!cancelada) throw ErrorApi.conflicto('NOT_PENDING', 'Solo las solicitudes pendientes pueden cancelarse.');
  return serializarUna(cancelada);
}

export async function decidir(id, { decision, comment }, usuario) {
  const { solicitud, ini, esDueno } = await cargar(id, usuario);
  if (!esDueno) throw ErrorApi.prohibido('Solo el propietario de la iniciativa puede resolver solicitudes.');
  if (solicitud.status !== 'pending') throw ErrorApi.conflicto('NOT_PENDING', 'La solicitud ya fue resuelta o cancelada.');

  const resuelta = await repo.actualizarSiPendiente(id, { status: decision, decisionComment: comment || null, decidedAt: new Date() });
  if (!resuelta) throw ErrorApi.conflicto('NOT_PENDING', 'La solicitud ya fue resuelta o cancelada.');

  if (decision === 'accepted') {
    // RN-14: aceptar incorpora automáticamente al equipo, con control de cupo atómico.
    const actualizada = await iniciativasRepo.agregarMiembroSiHayCupo(ini._id, { userId: solicitud.userId, roleId: solicitud.roleId, joinedAt: new Date() });
    if (!actualizada) {
      await repo.revertirAPendiente(id); // sin transacciones: compensación manual
      const cerrada = !['published', 'forming'].includes(ini.status);
      throw cerrada
        ? ErrorApi.conflicto('INITIATIVE_CLOSED', 'La iniciativa ya no recibe integrantes.')
        : ErrorApi.conflicto('NO_SPOTS', 'La iniciativa ya completó los espacios previstos.');
    }
  }
  return serializarUna(resuelta);
}