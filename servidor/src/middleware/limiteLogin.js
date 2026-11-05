import rateLimit from 'express-rate-limit';

// Solo cuentan los intentos fallidos: frena la fuerza bruta sin molestar a quien entra bien.
export const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({
    error: { code: 'TOO_MANY_REQUESTS', message: 'Demasiados intentos fallidos. Esperá unos minutos.', details: [] },
  }),
});