import { Schema, model } from 'mongoose';

const tokenRevocadoSchema = new Schema({
  jti: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
}, { versionKey: false });

// TTL: MongoDB borra el documento cuando pasa expiresAt.
tokenRevocadoSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RevokedToken = model('RevokedToken', tokenRevocadoSchema);