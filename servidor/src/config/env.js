import 'dotenv/config';

const requeridas = ['MONGODB_URI', 'CLIENT_ORIGIN', 'JWT_SECRET'];
const faltantes = requeridas.filter((nombre) => !process.env[nombre]);
if (faltantes.length) {
  console.error(`Faltan variables de entorno: ${faltantes.join(', ')}. Copiá .env.example a .env y completalo.`);
  process.exit(1);
}

export const config = Object.freeze({
  puerto: Number(process.env.PORT) || 3000,
  entorno: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI,
  origenCliente: process.env.CLIENT_ORIGIN,
  jwtSecreto: process.env.JWT_SECRET,
  jwtExpira: process.env.JWT_EXPIRES_IN || '2h',
  rondasBcrypt: Number(process.env.BCRYPT_ROUNDS) || 12,
  authDev: process.env.DEV_AUTH === 'true' && process.env.NODE_ENV !== 'production',
});