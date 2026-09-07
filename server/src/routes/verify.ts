import { Router } from 'express';
import { verifyController } from '../controllers/verifyController';

const router = Router();

router.post('/', verifyController);

export default router;
