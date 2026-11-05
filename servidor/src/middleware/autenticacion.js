import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import * as usuariosRepo from '../repositories/usuarios.repository.js';
import * as tokensRepo from '../repositories/tokens.repository.js';
import { ErrorApi } from '../utils/ErrorApi.js';

// Corre en toda petición a /api. Sin encabezado: visitante. Con encabezado inválido: 401.
export async function identificar(req, _res, next) {
  req.usuario = null;
  const cabecera = req.get('Authorization');
  if (!cabecera) return next();

  const [esquema, token] = cabecera.split(' ');
  if (esquema !== 'Bearer' || !token) throw ErrorApi.noAutenticado('El encabezado debe tener la forma "Authorization: Bearer <token>".');

  let carga;
  try {
    carga = jwt.verify(token, config.jwtSecreto, { algorithms: ['HS256'] });
  } catch (error) {
    throw ErrorApi.noAutenticado(error.name === 'TokenExpiredError' ? 'La sesión venció. Iniciá sesión de nuevo.' : 'El token no es válido.');
  }
  if (await tokensRepo.estaRevocado(carga.jti)) throw ErrorApi.noAutenticado('La sesión fue cerrada. Iniciá sesión de nuevo.');

  const usuario = await usuariosRepo.buscarActivoPorId(carga.sub);
  if (!usuario) throw ErrorApi.noAutenticado('La cuenta no existe o está inactiva.');

  req.usuario = { ...usuario, id: String(usuario._id) };
  req.token = { jti: carga.jti, exp: carga.exp };
  return next();
}

export function requerirAuth(req, _res, next) {
  if (!req.usuario) throw ErrorApi.noAutenticado();
  next();
}