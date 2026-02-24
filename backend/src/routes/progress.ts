import { Router } from 'express';
import { getProgress, resetPlayerProgress } from '../controllers/progressController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getProgress);
router.post('/reset', authenticateToken, resetPlayerProgress);

export default router;
