import { Types } from 'mongoose';
import { Request } from '../models/Request.js';
import { paginar } from '../utils/paginacion.js';

const ORDENES = ['createdAt', 'updatedAt'];

export const contarDeIniciativa = (initiativeId) => Request.countDocuments({ initiativeId });

export async function contarPorIniciativas(ids) {
  if (!ids.length) return new Map();
  const grupos = await Request.aggregate([{ $match: { initiativeId: { $in: ids } } }, { $group: { _id: '$initiativeId', total: { $sum: 1 } } }]);
  return new Map(grupos.map((g) => [String(g._id), g.total]));
}

export const contarPendientes = (initiativeId, userId) => Request.countDocuments({ initiativeId, userId, status: 'pending' });
export const buscarPorId = (id) => Request.findById(id).lean();

export async function crear(datos) {
  const documento = await Request.create(datos);
  return documento.toObject();
}

export const listarDeUsuario = (userId, q) => {
  const filtro = { userId: new Types.ObjectId(userId) };
  if (q.status) filtro.status = q.status;
  return paginar(Request, filtro, q, ORDENES, '-createdAt');
};

export const listarRecibidas = (idsIniciativas, q) => {
  const filtro = { initiativeId: { $in: idsIniciativas } };
  if (q.initiativeId) filtro.initiativeId = { $in: idsIniciativas.filter((id) => String(id) === q.initiativeId) };
  if (q.status) filtro.status = q.status;
  if (q.skill) filtro.offeredSkillId = q.skill;
  if (q.role) filtro.roleId = q.role;
  if (q.from || q.to) {
    filtro.createdAt = {};
    if (q.from) filtro.createdAt.$gte = new Date(`${q.from}T00:00:00.000Z`);
    if (q.to) filtro.createdAt.$lte = new Date(`${q.to}T23:59:59.999Z`);
  }
  return paginar(Request, filtro, q, ORDENES, '-createdAt');
};

// Cambio de estado condicionado a que siga pendiente: si otra petición ya la resolvió, no modifica nada.
export const actualizarSiPendiente = (id, cambios) =>
  Request.findOneAndUpdate({ _id: id, status: 'pending' }, cambios, { new: true, runValidators: true }).lean();

export const revertirAPendiente = (id) =>
  Request.updateOne({ _id: id }, { status: 'pending', decisionComment: null, decidedAt: null });