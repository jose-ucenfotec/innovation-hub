import { Types } from 'mongoose';
import { Initiative } from '../models/Initiative.js';
import { paginar, escaparRegex } from '../utils/paginacion.js';

const ORDENES = ['createdAt', 'updatedAt', 'title'];

// Traduce los filtros del contrato a una consulta de MongoDB.
function filtroListado(q, usuario) {
  const uid = usuario ? new Types.ObjectId(usuario.id) : null;
  const condiciones = [
    uid ? { $or: [{ visibility: { $ne: 'private' } }, { ownerId: uid }, { 'members.userId': uid }] } : { visibility: { $ne: 'private' } },
  ];
  if (q.owner === 'me') condiciones.push({ ownerId: uid });
  else if (q.owner) condiciones.push({ ownerId: new Types.ObjectId(q.owner) });
  if (q.member === 'me') condiciones.push({ 'members.userId': uid });
  if (q.status) condiciones.push({ status: q.status });
  else if (q.owner !== 'me' && q.member !== 'me') condiciones.push({ status: { $nin: ['draft', 'archived'] } });
  if (q.type) condiciones.push({ type: q.type });
  if (q.category) condiciones.push({ categoryId: q.category });
  if (q.skill) condiciones.push({ requiredSkillIds: q.skill });
  if (q.hasSpots === 'true') condiciones.push({ $expr: { $gt: ['$estimatedMembers', { $add: [{ $size: '$members' }, 1] }] } });
  if (q.q) {
    const patron = new RegExp(escaparRegex(q.q), 'i');
    condiciones.push({ $or: [{ title: patron }, { summary: patron }, { tags: patron }] });
  }
  return { $and: condiciones };
}

export const listar = (q, usuario) => paginar(Initiative, filtroListado(q, usuario), q, ORDENES, '-createdAt');
export const buscarPorId = (id) => Initiative.findById(id).lean();

export async function crear(datos) {
  const documento = await Initiative.create(datos);
  return documento.toObject();
}

export const actualizar = (id, cambios) => Initiative.findByIdAndUpdate(id, cambios, { new: true, runValidators: true }).lean();
export const eliminar = (id) => Initiative.deleteOne({ _id: id });

export async function quitarMiembro(id, userId) {
  const resultado = await Initiative.updateOne(
    { _id: id, 'members.userId': userId },
    { $pull: { members: { userId } }, $currentDate: { updatedAt: true } }
  );
  if (resultado.modifiedCount) {
    await Initiative.updateOne({ _id: id, status: 'forming', members: { $size: 0 } }, { status: 'published' });
  }
  return resultado.modifiedCount > 0;
}

// Visibles con acceso completo para el usuario: públicas, institucionales (con sesión) y las propias o de su equipo.
export function idsConAccesoCompleto(usuario) {
  const uid = new Types.ObjectId(usuario.id);
  return Initiative.distinct('_id', {
    $or: [{ visibility: { $in: ['public', 'institutional'] } }, { ownerId: uid }, { 'members.userId': uid }],
  });
}

export const idsDePropietario = (userId) => Initiative.distinct('_id', { ownerId: new Types.ObjectId(userId) });
export const buscarVarias = (ids) => Initiative.find({ _id: { $in: ids } }).lean();

// RN-14 y RN-15 en una sola operación atómica: solo agrega si sigue abierta, hay cupo y no es miembro.
export function agregarMiembroSiHayCupo(id, miembro) {
  return Initiative.findOneAndUpdate(
    {
      _id: id,
      status: { $in: ['published', 'forming'] },
      'members.userId': { $ne: miembro.userId },
      $expr: { $gt: ['$estimatedMembers', { $add: [{ $size: '$members' }, 1] }] },
    },
    { $push: { members: miembro }, $set: { status: 'forming' } },
    { new: true }
  ).lean();
}

export const marcarComoProyecto = (id) =>
  Initiative.findOneAndUpdate({ _id: id, status: { $in: ['published', 'forming'] } }, { status: 'project' }, { new: true }).lean();