import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';

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

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    if (!token) {
      setStatus('error');
      setMessage('Invalid reset link. Please request a new one.');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }

    const passwordError = getPasswordError(password);
    if (passwordError) {
      setStatus('error');
      setMessage(passwordError);
      return;
    }

    setStatus('loading');

    try {
      const response = await axios.post('http://localhost:3001/api/auth/reset-password', {
        token,
        password,
      });
      setStatus('success');
      setMessage(response.data.message || 'Password reset successful.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Password reset failed.');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">🔒</div>
          <h1>Reset Password</h1>
          <p>Create a new password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {message && (
            <div className={status === 'success' ? 'auth-success' : 'auth-error'}>{message}</div>
          )}

          <div className="form-group">
            <label htmlFor="password">New Password</label>
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

          <button type="submit" className="auth-button" disabled={status === 'loading'}>
            {status === 'loading' ? '⏳ Updating...' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login" className="auth-link">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
