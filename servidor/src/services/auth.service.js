import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import * as usuariosRepo from '../repositories/usuarios.repository.js';
import * as tokensRepo from '../repositories/tokens.repository.js';
import { mapasCatalogo } from '../repositories/catalogos.repository.js';
import { serializarUsuarioPropio } from '../utils/serializadores.js';
import { ErrorApi } from '../utils/ErrorApi.js';

// Si el correo no existe se compara igual contra un hash falso,
// para que la respuesta tarde lo mismo y no revele qué correos están registrados.
const HASH_FALSO = bcrypt.hashSync('no-existe-este-usuario', config.rondasBcrypt);

export async function registrar(datos) {
  if (await usuariosRepo.existeCorreo(datos.email)) throw ErrorApi.conflicto('EMAIL_TAKEN', 'Ya existe una cuenta con ese correo.');
  const passwordHash = await bcrypt.hash(datos.password, config.rondasBcrypt);
  const usuario = await usuariosRepo.crear({
    firstName: datos.firstName, lastName: datos.lastName, secondLastName: datos.secondLastName ?? null,
    email: datos.email, passwordHash, memberType: datos.memberType, career: datos.career, acceptedTermsAt: new Date(),
  });
  return serializarUsuarioPropio(usuario, await mapasCatalogo());
}

export async function iniciarSesion({ email, password }) {
  const usuario = await usuariosRepo.buscarConHashPorCorreo(email);
  const coincide = await bcrypt.compare(password, usuario?.passwordHash ?? HASH_FALSO);
  if (!usuario || !coincide || usuario.status !== 'active') {
    throw new ErrorApi(401, 'INVALID_CREDENTIALS', 'Correo o contraseña incorrectos.');
  }
  const token = jwt.sign({ sub: String(usuario._id) }, config.jwtSecreto, {
    algorithm: 'HS256', expiresIn: config.jwtExpira, jwtid: randomUUID(),
  });
  const { exp } = jwt.decode(token);
  const { passwordHash, ...sinHash } = usuario;
  return {
    token, tokenType: 'Bearer', expiresAt: new Date(exp * 1000).toISOString(),
    user: serializarUsuarioPropio(sinHash, await mapasCatalogo()),
  };
}

export async function cerrarSesion({ jti, exp }) {
  await tokensRepo.revocar(jti, new Date(exp * 1000));
}