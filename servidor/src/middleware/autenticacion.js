import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { ErrorApi } from '../utils/ErrorApi.js';
import { config } from '../config/env.js';

export async function identificar(req, _res, next) {
  req.usuario = null;
  const id = req.get('X-Dev-User');
  if (config.authDev && id && mongoose.isValidObjectId(id)) {
    const usuario = await User.findOne({ _id: id, status: 'active' }).lean();
    if (usuario) req.usuario = { ...usuario, id: String(usuario._id) };
  }
  next();
}

export function requerirAuth(req, _res, next) {
  if (!req.usuario) throw ErrorApi.noAutenticado();
  next();
}