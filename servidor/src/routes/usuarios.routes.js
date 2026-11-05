import { Router } from 'express';
import * as c from '../controllers/usuarios.controller.js';
import { requerirAuth } from '../middleware/autenticacion.js';
import { validar } from '../middleware/validar.js';
import { consultaUsuarios, cuerpoPerfil } from '../validators/usuarios.schemas.js';

const router = Router();
router.get('/users', requerirAuth, validar({ query: consultaUsuarios }), c.buscar);
router.put('/users/me', requerirAuth, validar({ body: cuerpoPerfil }), c.actualizar);
router.get('/users/:id', requerirAuth, c.obtener);
export default router;