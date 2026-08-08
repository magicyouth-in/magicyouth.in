import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import '../../styles/admin.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check status on mount — if already logged in, redirect to dashboard
  useEffect(() => {
    fetch('/api/auth/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.loggedIn) {
          navigate('/admin/dashboard');
        }
      })
      .catch(() => {});
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await res.json();

      if (data.success) {
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Invalid email/username or password.');
      }
    } catch {
      setError('An error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        {/* Brand logo & header */}
        <div className="admin-login-header">
          <img
            src="/assets/magic-logo.png"
            alt="MAGIC Youth Logo"
            className="admin-logo-img"
          />
          <h1 className="admin-login-title">MAGIC YOUTH</h1>
          <p className="admin-login-subtitle">Admin Portal</p>
        </div>

        {/* Login form card */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div className="admin-input-group">
            <label className="admin-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ width: 16, height: 16, color: '#6B7280', position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@magicyouth.in"
                className="admin-input"
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>
          </div>

          <div className="admin-input-group">
            <label className="admin-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ width: 16, height: 16, color: '#6B7280', position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="admin-input"
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#4B5563', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ borderRadius: '0.25rem', borderColor: '#D1D5DB', width: 16, height: 16, accentColor: '#5B21B6' }}
              />
              <span>Remember Me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-btn-primary"
          >
            {loading ? (
              <>
                <Loader2 style={{ width: 18, height: 18 }} className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In to Admin Portal</span>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
          <a href="/" style={{ fontSize: '0.8125rem', color: '#5B21B6', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
            <ArrowLeft style={{ width: 14, height: 14 }} />
            <span>Back to Public Website</span>
          </a>
        </div>
      </div>
    </div>
  );
}
