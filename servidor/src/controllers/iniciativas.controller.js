import * as servicio from '../services/iniciativas.service.js';

export async function listar(req, res) {
  res.json(await servicio.listar(req.validado.query, req.usuario));
}
export async function obtener(req, res) {
  res.json(await servicio.obtener(req.params.id, req.usuario));
}
export async function crear(req, res) {
  const ini = await servicio.crear(req.validado.body, req.usuario);
  res.status(201).location(`/api/initiatives/${ini.id}`).json(ini);
}
export async function actualizar(req, res) {
  res.json(await servicio.actualizar(req.params.id, req.validado.body, req.usuario));
}
export async function eliminar(req, res) {
  await servicio.eliminar(req.params.id, req.usuario);
  res.status(204).end();
}
export async function archivar(req, res) {
  res.json(await servicio.archivar(req.params.id, req.usuario));
}
export async function miembros(req, res) {
  res.json(await servicio.listarMiembros(req.params.id, req.usuario));
}
export async function retirarMiembro(req, res) {
  await servicio.retirarMiembro(req.params.id, req.params.userId, req.usuario);
  res.status(204).end();
}