import { RevokedToken } from '../models/RevokedToken.js';

export const revocar = (jti, expiresAt) => RevokedToken.updateOne({ jti }, { jti, expiresAt }, { upsert: true });
export const estaRevocado = async (jti) => Boolean(await RevokedToken.exists({ jti }));