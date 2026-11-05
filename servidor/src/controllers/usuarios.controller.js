import * as servicio from '../services/usuarios.service.js';

export async function buscar(req, res) { res.json(await servicio.buscar(req.validado.query)); }
export async function obtener(req, res) { res.json(await servicio.obtener(req.params.id)); }
export async function actualizar(req, res) { res.json(await servicio.actualizarPerfil(req.usuario, req.validado.body)); }