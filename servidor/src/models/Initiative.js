import { Schema, model } from 'mongoose';
import { TIPOS, VISIBILIDADES, ESTADOS_INICIATIVA } from './enums.js';

// Equipo embebido: acotado a 20 y siempre se lee con la iniciativa.
const miembroSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  roleId: { type: String, ref: 'Role', required: true },
  joinedAt: { type: Date, default: Date.now },
}, { _id: false });

const iniciativaSchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, enum: TIPOS, required: true },
  summary: { type: String, required: true },
  description: { type: String, required: true },
  problem: { type: String, required: true },
  beneficiaries: { type: String, required: true },
  categoryId: { type: String, ref: 'Category', required: true },
  requiredSkillIds: [{ type: String, ref: 'Skill' }],
  estimatedMembers: { type: Number, min: 1, max: 20, required: true },
  visibility: { type: String, enum: VISIBILIDADES, required: true },
  tags: { type: [String], default: [] },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: { type: [miembroSchema], default: [] },
  status: { type: String, enum: ESTADOS_INICIATIVA, default: 'published' },
}, { timestamps: true, versionKey: false });

iniciativaSchema.index({ status: 1, type: 1, categoryId: 1 });
iniciativaSchema.index({ ownerId: 1 });
iniciativaSchema.index({ 'members.userId': 1 });
iniciativaSchema.index({ requiredSkillIds: 1 });

export const Initiative = model('Initiative', iniciativaSchema);