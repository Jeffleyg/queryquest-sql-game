import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await axios.post('http://localhost:3001/api/auth/forgot-password', {
        email,
      });
      setStatus('sent');
      setMessage(response.data.message || 'If an account exists, a reset link has been sent.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Failed to send reset link. Please try again.');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">🔑</div>
          <h1>Forgot Password</h1>
          <p>We will send you a reset link if your email is registered.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {message && (
            <div className={status === 'sent' ? 'auth-success' : 'auth-error'}>{message}</div>
          )}

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

          <button type="submit" className="auth-button" disabled={status === 'loading'}>
            {status === 'loading' ? '⏳ Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login" className="auth-link">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
