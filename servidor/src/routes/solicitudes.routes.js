import { Router } from 'express';
import * as c from '../controllers/solicitudes.controller.js';
import { requerirAuth } from '../middleware/autenticacion.js';
import { validar } from '../middleware/validar.js';
import { consultaMias, consultaRecibidas, cuerpoDecision, cuerpoSolicitud } from '../validators/solicitudes.schemas.js';

// Todo el recurso requiere sesión; requerirAuth va en cada ruta para no afectar rutas de otros routers.
const router = Router();
router.post('/initiatives/:id/requests', requerirAuth, validar({ body: cuerpoSolicitud }), c.crear);
router.get('/requests/mine', requerirAuth, validar({ query: consultaMias }), c.mias);
router.get('/requests/received', requerirAuth, validar({ query: consultaRecibidas }), c.recibidas);
router.get('/requests/:id', requerirAuth, c.obtener);
router.put('/requests/:id', requerirAuth, validar({ body: cuerpoSolicitud }), c.actualizar);
router.post('/requests/:id/cancel', requerirAuth, c.cancelar);
router.post('/requests/:id/decision', requerirAuth, validar({ body: cuerpoDecision }), c.decidir);
export default router;