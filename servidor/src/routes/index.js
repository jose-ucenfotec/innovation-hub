import { Router } from 'express';
import auth from './auth.routes.js';
import usuarios from './usuarios.routes.js';
import catalogos from './catalogos.routes.js';
import iniciativas from './iniciativas.routes.js';
import solicitudes from './solicitudes.routes.js';
import proyectos from './proyectos.routes.js';

const router = Router();
router.use(auth);
router.use(usuarios);
router.use(catalogos);
router.use(iniciativas);
router.use(solicitudes);
router.use(proyectos);
export default router;