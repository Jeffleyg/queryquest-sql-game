import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { executeUserQuery, getQueryAnalysis } from '../controllers/queryController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

const queryLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, feedback: 'Too many queries. Please wait a moment.' },
});

router.post('/', authenticateToken, queryLimiter, executeUserQuery);
router.post('/analyze', authenticateToken, queryLimiter, getQueryAnalysis);

export default router;
