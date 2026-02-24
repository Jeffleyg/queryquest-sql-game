import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, verify, forgotPassword, reset, getProfile, firebaseLogin, resendVerificationEmail } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 20,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: 'Too many requests. Please try again later.' },
});

const loginLimiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: 8,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: 'Too many login attempts. Please try again later.' },
});

router.post('/register', authLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/firebase', authLimiter, firebaseLogin);
router.post('/verify-email', authLimiter, verify);
router.post('/resend-verification', authLimiter, resendVerificationEmail);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, reset);
router.get('/profile', authenticateToken, getProfile);

export default router;
