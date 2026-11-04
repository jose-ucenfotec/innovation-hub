import { Schema, model } from 'mongoose';
import { ESTADOS_PROYECTO } from './enums.js';

const proyectoSchema = new Schema({
  initiativeId: { type: Schema.Types.ObjectId, ref: 'Initiative', required: true, unique: true }, // RN-18
  name: { type: String, required: true },
  objective: { type: String, required: true },
  description: { type: String, required: true },
  technologies: { type: [String], default: [] },
  startDate: { type: String, required: true },        // YYYY-MM-DD
  estimatedEndDate: { type: String, default: null },  // YYYY-MM-DD
  repositoryUrl: { type: String, default: null },
  status: { type: String, enum: ESTADOS_PROYECTO, default: 'planning' },
}, { timestamps: true, versionKey: false });

export const Project = model('Project', proyectoSchema);