import { Schema, model } from 'mongoose';
import { NIVELES, TIPOS_MIEMBRO } from './enums.js';

const competenciaSchema = new Schema({
  skillId: { type: String, ref: 'Skill', required: true },
  level: { type: String, enum: NIVELES, required: true },
}, { _id: false });

const usuarioSchema = new Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  secondLastName: { type: String, default: null },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false }, // nunca sale en consultas por defecto
  memberType: { type: String, enum: TIPOS_MIEMBRO, required: true },
  career: { type: String, required: true },
  bio: { type: String, default: '' },
  skills: { type: [competenciaSchema], default: [] },
  interests: { type: [String], default: [] },
  availability: {
    hoursPerWeek: { type: Number, default: 0 },
    detail: { type: String, default: '' },
  },
  portfolioUrl: { type: String, default: null },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  acceptedTermsAt: { type: Date, default: null },
}, { timestamps: true, versionKey: false });

export const User = model('User', usuarioSchema);