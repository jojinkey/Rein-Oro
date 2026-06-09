import { Router } from 'express';
import { registerApiRoutes } from '../controller/apiController.js';

const router = Router();

registerApiRoutes(router);

export default router;
