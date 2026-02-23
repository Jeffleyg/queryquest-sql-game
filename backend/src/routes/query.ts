import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { executeUserQuery } from '../controllers/queryController';

const router = Router();

const queryLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, feedback: 'Too many queries. Please wait a moment.' },
});

router.post('/', queryLimiter, executeUserQuery);

export default router;
