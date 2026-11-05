import * as servicio from '../services/solicitudes.service.js';

export async function crear(req, res) {
  const solicitud = await servicio.crear(req.params.id, req.validado.body, req.usuario);
  res.status(201).location(`/api/requests/${solicitud.id}`).json(solicitud);
}
export async function mias(req, res) { res.json(await servicio.mias(req.validado.query, req.usuario)); }
export async function recibidas(req, res) { res.json(await servicio.recibidas(req.validado.query, req.usuario)); }
export async function obtener(req, res) { res.json(await servicio.obtener(req.params.id, req.usuario)); }
export async function actualizar(req, res) { res.json(await servicio.actualizar(req.params.id, req.validado.body, req.usuario)); }
export async function cancelar(req, res) { res.json(await servicio.cancelar(req.params.id, req.usuario)); }
export async function decidir(req, res) { res.json(await servicio.decidir(req.params.id, req.validado.body, req.usuario)); }