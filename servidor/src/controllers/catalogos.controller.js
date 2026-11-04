import * as repo from '../repositories/catalogos.repository.js';

export async function categorias(_req, res) {
  res.json((await repo.listarCategorias()).map((c) => ({ id: c._id, name: c.name, icon: c.icon })));
}
export async function competencias(_req, res) {
  res.json((await repo.listarCompetencias()).map((c) => ({ id: c._id, name: c.name, area: c.area })));
}
export async function roles(_req, res) {
  res.json((await repo.listarRoles()).map((r) => ({ id: r._id, name: r.name })));
}