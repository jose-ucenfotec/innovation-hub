import { Schema, model } from 'mongoose';

// Catálogos con _id de texto legible: 'cat-tecnologia', 'comp-javascript', 'rol-frontend'.
const opciones = { versionKey: false };
export const Category = model('Category', new Schema({ _id: String, name: { type: String, required: true }, icon: String }, opciones));
export const Skill = model('Skill', new Schema({ _id: String, name: { type: String, required: true }, area: String }, opciones));
export const Role = model('Role', new Schema({ _id: String, name: { type: String, required: true } }, opciones));