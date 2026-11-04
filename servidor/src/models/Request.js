import { Schema, model } from 'mongoose';
import { ESTADOS_SOLICITUD } from './enums.js';

const solicitudSchema = new Schema({
  initiativeId: { type: Schema.Types.ObjectId, ref: 'Initiative', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  offeredSkillId: { type: String, ref: 'Skill', required: true },
  roleId: { type: String, ref: 'Role', required: true },
  availability: { type: String, required: true },
  status: { type: String, enum: ESTADOS_SOLICITUD, default: 'pending' },
  decisionComment: { type: String, default: null },
  decidedAt: { type: Date, default: null },
}, { timestamps: true, versionKey: false });

solicitudSchema.index({ initiativeId: 1, userId: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });
solicitudSchema.index({ userId: 1, createdAt: -1 });

export const Request = model('Request', solicitudSchema);