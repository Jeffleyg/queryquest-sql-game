import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../utils/firebase';
import api from '../utils/api';
import { getFirebaseAuthErrorMessage } from '../utils/firebaseError';
import '../styles/Auth.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getPasswordError = (value: string) => {
    if (value.length < 8) {
      return 'Password must be at least 8 characters long.';
    }

    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return 'Password must include an uppercase letter, a lowercase letter, and a number.';
    }

    return null;
  };

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = getPasswordError(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setLoading(true);

    try {
      const credentials = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credentials.user, { displayName: username });
      await sendEmailVerification(credentials.user);

      const idToken = await credentials.user.getIdToken();
      await api.post('/auth/firebase', {
        idToken,
        username,
      });

      navigate('/pending-verification', { state: { email } });
    } catch (err: any) {
      const message = err.response?.data?.error || getFirebaseAuthErrorMessage(err, 'Registration failed. Please try again.');
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleRegister() {
    setError('');
    setLoading(true);

    try {
      const credentials = await signInWithPopup(auth, googleProvider);
      const idToken = await credentials.user.getIdToken();
      const response = await api.post('/auth/firebase', {
        idToken,
        username,
      });

      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userId', response.data.user.id);
      localStorage.setItem('username', response.data.user.username);
      localStorage.setItem('userEmail', response.data.user.email);
      localStorage.setItem('isVerified', response.data.user.isVerified);

      navigate('/');
    } catch (err: any) {
      const message = err.response?.data?.error || getFirebaseAuthErrorMessage(err, 'Google signup failed. Please try again.');
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">🎮</div>
          <h1>Join QueryQuest!</h1>
          <p>Start your SQL learning adventure</p>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
              minLength={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
            />
            <small className="auth-hint">At least 8 characters, with uppercase, lowercase, and a number.</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? '⏳ Creating account...' : '🚀 Create Account'}
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button type="button" className="auth-button google-button" onClick={handleGoogleRegister} disabled={loading}>
            {loading ? '⏳ Connecting...' : 'Continue with Google'}
          </button>
        </form>

        <div className="auth-links">
          <span>Already have an account?</span>
          <Link to="/login" className="auth-link">Login</Link>
        </div>
      </div>
    </div>
  );
}
