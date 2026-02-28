import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../styles/Auth.css';

export default function PendingVerificationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || 'your email';
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');

  async function resendVerificationEmail() {
    setLoading(true);
    try {
      await api.post('/auth/resend-verification', {
        email,
      });
      setMessage('✅ Verification email resent! Check your inbox.');
    } catch (err: any) {
      setMessage('❌ ' + (err.response?.data?.error || 'Failed to resend email'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">✉️</div>
          <h1>Verify Your Email</h1>
          <p>Check your inbox to get started</p>
        </div>

        <div style={{ textAlign: 'center', padding: '30px 0', color: '#8b92b8' }}>
          <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
            We've sent a verification link to <strong style={{ color: '#a78bfa' }}>{email}</strong>
          </p>

          <p style={{ fontSize: '14px', marginBottom: '30px' }}>
            Click the button in the email to verify your account and start your SQL learning adventure!
          </p>

          {message && (
            <div style={{
              backgroundColor: message.includes('✅') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${message.includes('✅') ? '#22c55e' : '#ef4444'}`,
              color: message.includes('✅') ? '#86efac' : '#fca5a5',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
            }}>
              {message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={resendVerificationEmail}
              disabled={loading}
              className="auth-button"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)', minWidth: '150px' }}
            >
              {loading ? '⏳ Sending...' : '📧 Resend Email'}
            </button>

            <button
              onClick={() => navigate('/login')}
              className="auth-button"
              style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', minWidth: '150px' }}
            >
              Back to Login
            </button>
          </div>

          <p style={{ fontSize: '12px', marginTop: '30px', color: '#6b7280' }}>
            If you didn't receive the email, check your spam folder or click "Resend Email" above.
          </p>
        </div>
      </div>
    </div>
  );
}
