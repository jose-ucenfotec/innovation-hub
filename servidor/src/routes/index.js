import { Router } from 'express';
import { config } from '../config/env.js';
import catalogos from './catalogos.routes.js';
import iniciativas from './iniciativas.routes.js';
import solicitudes from './solicitudes.routes.js';
import proyectos from './proyectos.routes.js';
import dev from './dev.routes.js';

const router = Router();
router.use(catalogos);
if (config.authDev) router.use('/dev', dev);
router.use(iniciativas);
router.use(solicitudes);
router.use(proyectos);
export default router;