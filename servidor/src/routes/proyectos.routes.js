import { Router } from 'express';
import * as c from '../controllers/proyectos.controller.js';
import { requerirAuth } from '../middleware/autenticacion.js';
import { validar } from '../middleware/validar.js';
import { consultaProyectos, cuerpoProyecto } from '../validators/proyectos.schemas.js';

const router = Router();
router.post('/initiatives/:id/project', requerirAuth, validar({ body: cuerpoProyecto }), c.convertir);
router.get('/projects', requerirAuth, validar({ query: consultaProyectos }), c.listar);
router.get('/projects/:id', requerirAuth, c.obtener);
export default router;