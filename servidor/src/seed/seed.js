import { readFile } from 'node:fs/promises';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { conectar, desconectar } from '../db/conexion.js';
import { Category, Skill, Role } from '../models/Catalogos.js';
import { User } from '../models/User.js';
import { Initiative } from '../models/Initiative.js';
import { Request } from '../models/Request.js';
import { Project } from '../models/Project.js';
import { RevokedToken } from '../models/RevokedToken.js';

export const CONTRASENA_PRUEBA = 'Prueba123!';

const leer = async (nombre) => JSON.parse(await readFile(new URL(`./datos/${nombre}.json`, import.meta.url), 'utf8'));
const oid = (id) => new mongoose.Types.ObjectId(id);
const fecha = (valor) => (valor ? new Date(valor) : null);

await conectar();
await mongoose.connection.dropDatabase();
for (const modelo of [Category, Skill, Role, User, Initiative, Request, Project, RevokedToken]) await modelo.createIndexes();

const catalogo = async (modelo, nombre) => modelo.collection.insertMany((await leer(nombre)).map(({ id, ...resto }) => ({ _id: id, ...resto })));
await catalogo(Category, 'categories');
await catalogo(Skill, 'skills');
await catalogo(Role, 'roles');

const hash = await bcrypt.hash(CONTRASENA_PRUEBA, config.rondasBcrypt);
await User.collection.insertMany((await leer('users')).map(({ id, createdAt, updatedAt, ...resto }) => ({
  _id: oid(id), ...resto, passwordHash: hash, acceptedTermsAt: fecha(createdAt), createdAt: fecha(createdAt), updatedAt: fecha(updatedAt),
})));

await Initiative.collection.insertMany((await leer('initiatives')).map(({ id, ownerId, members, createdAt, updatedAt, ...resto }) => ({
  _id: oid(id), ...resto, ownerId: oid(ownerId),
  members: members.map((m) => ({ userId: oid(m.userId), roleId: m.roleId, joinedAt: fecha(m.joinedAt) })),
  createdAt: fecha(createdAt), updatedAt: fecha(updatedAt),
})));

await Request.collection.insertMany((await leer('requests')).map(({ id, initiativeId, userId, decidedAt, createdAt, updatedAt, ...resto }) => ({
  _id: oid(id), ...resto, initiativeId: oid(initiativeId), userId: oid(userId),
  decidedAt: fecha(decidedAt), createdAt: fecha(createdAt), updatedAt: fecha(updatedAt),
})));

await Project.collection.insertMany((await leer('projects')).map(({ id, initiativeId, createdAt, updatedAt, ...resto }) => ({
  _id: oid(id), ...resto, initiativeId: oid(initiativeId), createdAt: fecha(createdAt), updatedAt: fecha(updatedAt),
})));

const usuarios = await User.find().select('email').lean();
console.log('Datos de prueba cargados. Usuarios (contraseña para todos: %s):', CONTRASENA_PRUEBA);
usuarios.forEach((u) => console.log(`  ${u._id}  ${u.email}`));
await desconectar();