import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../utils/firebase';
import api from '../utils/api';
import { getFirebaseAuthErrorMessage } from '../utils/firebaseError';
import '../styles/Auth.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const credentials = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credentials.user.getIdToken();
      const response = await api.post('/auth/firebase', {
        idToken,
      });

      // Save token and user data
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userId', response.data.user.id);
      localStorage.setItem('username', response.data.user.username);
      localStorage.setItem('userEmail', response.data.user.email);
      localStorage.setItem('isVerified', response.data.user.isVerified);

      // Redirect to dashboard
      navigate('/');
    } catch (err: any) {
      const message = err.response?.data?.error || getFirebaseAuthErrorMessage(err, 'Login failed. Please try again.');
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError('');
    setLoading(true);

    try {
      const credentials = await signInWithPopup(auth, googleProvider);
      const idToken = await credentials.user.getIdToken();
      const response = await api.post('/auth/firebase', {
        idToken,
      });

      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userId', response.data.user.id);
      localStorage.setItem('username', response.data.user.username);
      localStorage.setItem('userEmail', response.data.user.email);
      localStorage.setItem('isVerified', response.data.user.isVerified);

      navigate('/');
    } catch (err: any) {
      const message = err.response?.data?.error || getFirebaseAuthErrorMessage(err, 'Google login failed. Please try again.');
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
          <h1>Welcome Back!</h1>
          <p>Log in to continue your SQL adventure</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

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
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? '⏳ Logging in...' : '🚀 Login'}
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button type="button" className="auth-button google-button" onClick={handleGoogleLogin} disabled={loading}>
            {loading ? '⏳ Connecting...' : 'Continue with Google'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
          <span className="auth-separator">•</span>
          <Link to="/register" className="auth-link">Create account</Link>
        </div>
      </div>
    </div>
  );
}
