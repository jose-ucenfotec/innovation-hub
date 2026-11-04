import { Router } from 'express';
import { config } from '../config/env.js';
import catalogos from './catalogos.routes.js';
import dev from './dev.routes.js';
import iniciativas from './iniciativas.routes.js';

const router = Router();
router.use(catalogos);
router.use('/initiatives', iniciativas);
if (config.authDev) router.use('/dev', dev);
export default router;