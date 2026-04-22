import { Router } from 'express';
import { getTestMessage } from '../controllers/testController.js';

const router = Router();

router.get('/test', getTestMessage);

export default router;
