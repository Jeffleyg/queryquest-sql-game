import { Request, Response } from 'express';
import { createUser, verifyEmail, loginUser, requestPasswordReset, resetPassword, getUserById, getUserByFirebaseUid, createUserFromFirebase, updateUserVerification } from '../services/authService';
import { generateToken } from '../middleware/auth';
import { firebaseAdmin } from '../config/firebase';

function getPasswordError(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumber) {
    return 'Password must include an uppercase letter, a lowercase letter, and a number.';
  }

  return null;
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, username } = req.body;

    // Validation
    if (!email || !password || !username) {
      res.status(400).json({ error: 'Email, password, and username are required' });
      return;
    }

    const passwordError = getPasswordError(password);
    if (passwordError) {
      res.status(400).json({ error: passwordError });
      return;
    }

    if (username.length < 3) {
      res.status(400).json({ error: 'Username must be at least 3 characters' });
      return;
    }

    const user = await createUser(email, password, username);
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isVerified: user.is_verified,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Email already registered') {
      res.status(400).json({ error: 'Email already registered' });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await loginUser(email, password);

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (!user.is_verified) {
      res.status(403).json({ error: 'Please verify your email before logging in.' });
      return;
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isVerified: user.is_verified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function verify(req: Request, res: Response): Promise<void> {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ error: 'Verification token required' });
      return;
    }

    const success = await verifyEmail(token);

    if (success) {
      res.json({ message: 'Email verified successfully! You can now access all features.' });
    } else {
      res.status(400).json({ error: 'Invalid or expired verification token' });
    }
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const success = await requestPasswordReset(email);

    // Always return success to prevent email enumeration
    res.json({ 
      message: 'If an account exists with that email, a password reset link has been sent.' 
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Request failed' });
  }
}

export async function reset(req: Request, res: Response): Promise<void> {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ error: 'Token and new password are required' });
      return;
    }

    const passwordError = getPasswordError(password);
    if (passwordError) {
      res.status(400).json({ error: passwordError });
      return;
    }

    const success = await resetPassword(token, password);

    if (success) {
      res.json({ message: 'Password reset successfully! You can now log in with your new password.' });
    } else {
      res.status(400).json({ error: 'Invalid or expired reset token' });
    }
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;

    const user = await getUserById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isVerified: user.is_verified,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
}

export async function firebaseLogin(req: Request, res: Response): Promise<void> {
  try {
    const { idToken, username } = req.body;

    if (!idToken) {
      res.status(400).json({ error: 'Firebase ID token required' });
      return;
    }

    const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);
    const email = decoded.email;

    if (!email) {
      res.status(400).json({ error: 'Firebase account must have an email' });
      return;
    }

    const emailPrefix = email.split('@')[0];
    const displayName = decoded.name || username || emailPrefix;
    const isVerified = !!decoded.email_verified;

    let user = await getUserByFirebaseUid(decoded.uid);

    if (!user) {
      user = await createUserFromFirebase(decoded.uid, email, displayName, isVerified);
    } else if (isVerified && !user.is_verified) {
      await updateUserVerification(user.id, true);
      user.is_verified = true;
    }

    if (!user.is_verified) {
      res.status(403).json({ error: 'Please verify your email before logging in.' });
      return;
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isVerified: user.is_verified,
      },
    });
  } catch (error) {
    console.error('Firebase login error:', error);
    res.status(500).json({ error: 'Firebase login failed' });
  }
}

export async function resendVerificationEmail(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const user = await getUserById(email);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.is_verified) {
      res.status(400).json({ error: 'Email already verified' });
      return;
    }

    const verificationToken = (await import('uuid')).v4();

    await (await import('../config/database')).default.query(
      `UPDATE users SET verification_token = $1 WHERE email = $2`,
      [verificationToken, email]
    );

    await (await import('../services/emailService')).sendVerificationEmail(email, verificationToken, user.username);

    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
}
