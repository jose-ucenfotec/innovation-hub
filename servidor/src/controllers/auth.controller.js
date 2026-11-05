import * as servicio from '../services/auth.service.js';
import * as usuarios from '../services/usuarios.service.js';

export async function registrar(req, res) {
  const usuario = await servicio.registrar(req.validado.body);
  res.status(201).location(`/api/users/${usuario.id}`).json(usuario);
}
export async function login(req, res) {
  res.json(await servicio.iniciarSesion(req.validado.body));
}
export async function logout(req, res) {
  await servicio.cerrarSesion(req.token);
  res.status(204).end();
}
export async function me(req, res) {
  res.json(await usuarios.perfilPropio(req.usuario));
}