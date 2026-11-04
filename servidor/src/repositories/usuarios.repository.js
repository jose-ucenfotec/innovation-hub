import { User } from '../models/User.js';

const CAMPOS_RESUMEN = 'firstName lastName secondLastName career skills';

export async function mapaPorIds(ids) {
  const usuarios = await User.find({ _id: { $in: ids } }).select(CAMPOS_RESUMEN).lean();
  return new Map(usuarios.map((u) => [String(u._id), u]));
}

export const buscarActivoPorId = (id) => User.findOne({ _id: id, status: 'active' }).lean();