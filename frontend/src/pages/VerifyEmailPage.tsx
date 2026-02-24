import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  async function verifyEmail(token: string) {
    try {
      const response = await axios.post('http://localhost:3001/api/auth/verify-email', {
        token,
      });

      setStatus('success');
      setMessage(response.data.message);
      
      // Update local storage
      localStorage.setItem('isVerified', 'true');

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Verification failed');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            {status === 'verifying' && '⏳'}
            {status === 'success' && '✅'}
            {status === 'error' && '❌'}
          </div>
          <h1>
            {status === 'verifying' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h1>
        </div>

        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          {status === 'verifying' && (
            <p style={{ color: '#8b92b8' }}>Please wait while we verify your email...</p>
          )}
          
          {status === 'success' && (
            <>
              <p style={{ color: '#86efac', marginBottom: '20px' }}>{message}</p>
              <p style={{ color: '#8b92b8' }}>Redirecting to dashboard...</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <p style={{ color: '#fca5a5', marginBottom: '20px' }}>{message}</p>
              <Link to="/login" className="auth-button" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Go to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
