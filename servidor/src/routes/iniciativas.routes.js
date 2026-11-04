import { Router } from 'express';
import * as c from '../controllers/iniciativas.controller.js';
import { requerirAuth } from '../middleware/autenticacion.js';
import { validar } from '../middleware/validar.js';
import { consultaIniciativas, consultaMiembros, cuerpoIniciativa } from '../validators/iniciativas.schemas.js';

const router = Router();
// requerirAuth va antes que validar: sin sesión se responde 401 aunque el cuerpo sea inválido.
router.get('/initiatives', validar({ query: consultaIniciativas }), c.listar);
router.post('/initiatives', requerirAuth, validar({ body: cuerpoIniciativa }), c.crear);
router.get('/initiatives/:id', c.obtener);
router.put('/initiatives/:id', requerirAuth, validar({ body: cuerpoIniciativa }), c.actualizar);
router.delete('/initiatives/:id', requerirAuth, c.eliminar);
router.post('/initiatives/:id/archive', requerirAuth, c.archivar);
router.get('/initiatives/:id/members', validar({ query: consultaMiembros }), c.miembros);
router.delete('/initiatives/:id/members/:userId', requerirAuth, c.retirarMiembro);
export default router;