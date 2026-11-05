import { Router } from 'express';
import * as c from '../controllers/auth.controller.js';
import { requerirAuth } from '../middleware/autenticacion.js';
import { limiteLogin } from '../middleware/limiteLogin.js';
import { validar } from '../middleware/validar.js';
import { cuerpoLogin, cuerpoRegistro } from '../validators/auth.schemas.js';

const router = Router();
router.post('/auth/register', validar({ body: cuerpoRegistro }), c.registrar);
router.post('/auth/login', limiteLogin, validar({ body: cuerpoLogin }), c.login);
router.post('/auth/logout', requerirAuth, c.logout);
router.get('/auth/me', requerirAuth, c.me);
export default router;