import { Request } from '../models/Request.js';

export const contarDeIniciativa = (initiativeId) => Request.countDocuments({ initiativeId });

export async function contarPorIniciativas(ids) {
  if (!ids.length) return new Map();
  const grupos = await Request.aggregate([{ $match: { initiativeId: { $in: ids } } }, { $group: { _id: '$initiativeId', total: { $sum: 1 } } }]);
  return new Map(grupos.map((g) => [String(g._id), g.total]));
}