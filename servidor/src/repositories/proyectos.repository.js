import { Project } from '../models/Project.js';

export const buscarPorIniciativa = (initiativeId) => Project.findOne({ initiativeId }).lean();

export async function mapaPorIniciativas(ids) {
  const proyectos = await Project.find({ initiativeId: { $in: ids } }).lean();
  return new Map(proyectos.map((p) => [String(p.initiativeId), p]));
}