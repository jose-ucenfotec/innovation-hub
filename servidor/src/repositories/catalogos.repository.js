import { Category, Skill, Role } from '../models/Catalogos.js';

export const listarCategorias = () => Category.find().sort({ name: 1 }).lean();
export const listarCompetencias = () => Skill.find().sort({ name: 1 }).lean();
export const listarRoles = () => Role.find().sort({ name: 1 }).lean();

// Mapas id → documento para serializar sin consultas repetidas.
export async function mapasCatalogo() {
  const [categorias, competencias, roles] = await Promise.all([listarCategorias(), listarCompetencias(), listarRoles()]);
  const mapa = (lista) => new Map(lista.map((x) => [x._id, x]));
  return { categorias: mapa(categorias), competencias: mapa(competencias), roles: mapa(roles) };
}