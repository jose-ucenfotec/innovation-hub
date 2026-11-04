import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env.js';
import rutas from './routes/index.js';
import { identificar } from './middleware/autenticacion.js';
import { noEncontrado } from './middleware/noEncontrado.js';
import { manejadorErrores } from './middleware/manejadorErrores.js';

export function crearApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  // CORS explícito: solo el origen del cliente React.
  app.use(cors({
    origin: config.origenCliente,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', ...(config.authDev ? ['X-Dev-User'] : [])],
    exposedHeaders: ['Location'],
  }));
  app.use(express.json({ limit: '100kb' }));
  app.use(morgan('dev'));
  app.use('/api', identificar, rutas);
  app.use(noEncontrado);
  app.use(manejadorErrores);
  return app;
}