import { User } from '../models/User.js';
import { paginar, escaparRegex } from '../utils/paginacion.js';

const CAMPOS_RESUMEN = 'firstName lastName secondLastName career skills';

export async function mapaPorIds(ids) {
  const usuarios = await User.find({ _id: { $in: ids } }).select(CAMPOS_RESUMEN).lean();
  return new Map(usuarios.map((u) => [String(u._id), u]));
}

export const buscarActivoPorId = (id) => User.findOne({ _id: id, status: 'active' }).lean();
export const existeCorreo = (email) => User.exists({ email });
// Única consulta que trae el hash; solo la usa el login.
export const buscarConHashPorCorreo = (email) => User.findOne({ email }).select('+passwordHash').lean();

export async function crear(datos) {
  const documento = await User.create(datos);
  const { passwordHash, ...sinHash } = documento.toObject();
  return sinHash;
}

export const actualizar = (id, cambios) => User.findByIdAndUpdate(id, cambios, { new: true, runValidators: true }).lean();

export function buscar(q) {
  const condiciones = [{ status: 'active' }];
  // Cada palabra debe aparecer en alguno de los nombres: "ana mora" encuentra a Ana Mora Jiménez.
  for (const palabra of (q.q ?? '').split(/\s+/).filter(Boolean)) {
    const patron = new RegExp(escaparRegex(palabra), 'i');
    condiciones.push({ $or: [{ firstName: patron }, { lastName: patron }, { secondLastName: patron }] });
  }
  if (q.skill) condiciones.push({ 'skills.skillId': q.skill });
  if (q.career) condiciones.push({ career: new RegExp(escaparRegex(q.career), 'i') });
  if (q.available === 'true') condiciones.push({ 'availability.hoursPerWeek': { $gt: 0 } });
  return paginar(User, { $and: condiciones }, q, ['firstName', 'lastName', 'createdAt'], 'firstName');
}