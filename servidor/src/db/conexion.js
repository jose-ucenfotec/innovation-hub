import mongoose from 'mongoose';
import { config } from '../config/env.js';

mongoose.set('strictQuery', true);

export async function conectar() {
  await mongoose.connect(config.mongoUri);
  console.log('MongoDB conectado');
}

export const desconectar = () => mongoose.disconnect();