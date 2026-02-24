import { Router } from 'express';
import { getProgress, resetPlayerProgress } from '../controllers/progressController';

const router = Router();

router.get('/', getProgress);
router.post('/reset', resetPlayerProgress);

export default router;
