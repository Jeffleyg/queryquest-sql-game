import { Router } from 'express';
import { register, login, verify, forgotPassword, reset, getProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verify);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', reset);
router.get('/profile', authenticateToken, getProfile);

export default router;
