import * as servicio from '../services/proyectos.service.js';

export async function convertir(req, res) {
  const proyecto = await servicio.convertir(req.params.id, req.validado.body, req.usuario);
  res.status(201).location(`/api/projects/${proyecto.id}`).json(proyecto);
}
export async function listar(req, res) { res.json(await servicio.listar(req.validado.query, req.usuario)); }
export async function obtener(req, res) { res.json(await servicio.obtener(req.params.id, req.usuario)); }