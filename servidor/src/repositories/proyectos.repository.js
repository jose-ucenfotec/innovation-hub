import { Project } from '../models/Project.js';
import { paginar } from '../utils/paginacion.js';

export const buscarPorIniciativa = (initiativeId) => Project.findOne({ initiativeId }).lean();
export const buscarPorId = (id) => Project.findById(id).lean();

export async function mapaPorIniciativas(ids) {
  const proyectos = await Project.find({ initiativeId: { $in: ids } }).lean();
  return new Map(proyectos.map((p) => [String(p.initiativeId), p]));
}

export async function crear(datos) {
  const documento = await Project.create(datos);
  return documento.toObject();
}

export const listarDeIniciativas = (ids, q) => {
  const filtro = { initiativeId: { $in: ids } };
  if (q.status) filtro.status = q.status;
  return paginar(Project, filtro, q, ['createdAt', 'name', 'startDate'], '-createdAt');
};