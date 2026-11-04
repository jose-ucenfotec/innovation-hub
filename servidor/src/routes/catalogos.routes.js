import { Router } from 'express';
import * as controlador from '../controllers/catalogos.controller.js';

const router = Router();
router.get('/categories', controlador.categorias);
router.get('/skills', controlador.competencias);
router.get('/roles', controlador.roles);
export default router;