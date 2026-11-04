import { config } from './config/env.js';
import { conectar } from './db/conexion.js';
import { crearApp } from './app.js';

try {
  await conectar();
} catch (error) {
  console.error('No se pudo conectar a MongoDB. ¿Está corriendo el servicio?', error.message);
  process.exit(1);
}

crearApp().listen(config.puerto, () => console.log(`API escuchando en http://localhost:${config.puerto}/api`));