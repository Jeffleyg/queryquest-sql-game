import { Router } from 'express';
import { getProgress, resetPlayerProgress, getRankingsLeaderboard } from '../controllers/progressController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getProgress);
router.post('/reset', authenticateToken, resetPlayerProgress);
router.get('/rankings', getRankingsLeaderboard);

export default router;
