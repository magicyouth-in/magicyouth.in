/**
 * src/pages/member/MemberLogin.jsx
 * Dedicated Member Login page — completely separate from Admin login.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function MemberLogin() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ memberId: '', password: '', rememberMe: false });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    fetch('/api/member/auth/status', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.loggedIn) navigate('/member/dashboard', { replace: true });
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.memberId.trim() || !form.password) {
      setError('Member ID and password are required.');
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch('/api/member/auth/login', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ memberId: form.memberId.trim(), password: form.password, rememberMe: form.rememberMe }),
      });
      const data = await res.json();
      if (data.success) {
        navigate('/member/dashboard', { replace: true });
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <Loader2 size={36} className="animate-spin" color="#0284C7" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #EFF6FF 0%, #FFF1F2 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>

      {/* Back link */}
      <div style={{ width: '100%', maxWidth: '420px', marginBottom: '1rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to website
        </Link>
      </div>

      <div style={{ width: '100%', maxWidth: '420px', background: '#FFFFFF', borderRadius: '1.25rem', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', padding: '2.5rem', border: '1px solid #E2E8F0' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img src="/assets/magic-logo.png" alt="MAGIC Youth" style={{ width: '60px', height: '60px', objectFit: 'contain', marginBottom: '0.75rem' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <ShieldCheck size={20} color="#0284C7" />
            <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Member Portal</h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>Official Member Access &amp; Application</p>
        </div>

        {/* Not yet a member? Direct Join Option */}
        <div style={{ background: '#F0F9FF', border: '1.5px solid #BAE6FD', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0369A1', marginBottom: '0.25rem' }}>
            Not yet a member?
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#475569', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
            Submit your membership application or leadership nomination directly.
          </p>
          <Link
            to="/join"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              backgroundColor: 'var(--primary-blue)',
              color: '#FFFFFF',
              padding: '0.5rem 1.25rem',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)'
            }}
          >
            JOIN MAGIC &rarr;
          </Link>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Already a Member?</span>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#BE123C', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="on">
          {/* Member ID */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
              Member ID
            </label>
            <input
              type="text"
              value={form.memberId}
              onChange={e => setForm(f => ({ ...f, memberId: e.target.value }))}
              placeholder="e.g. MAGIC-ALIET-0001"
              autoComplete="username"
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #E2E8F0', borderRadius: '0.625rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s', fontFamily: 'monospace', letterSpacing: '0.05em' }}
              onFocus={e => e.target.style.borderColor = '#0284C7'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Enter your password"
                autoComplete="current-password"
                style={{ width: '100%', padding: '0.75rem 2.75rem 0.75rem 1rem', border: '1.5px solid #E2E8F0', borderRadius: '0.625rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#0284C7'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'}
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '0.25rem' }}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={form.rememberMe}
              onChange={e => setForm(f => ({ ...f, rememberMe: e.target.checked }))}
              style={{ accentColor: '#0284C7', width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="rememberMe" style={{ fontSize: '0.875rem', color: '#475569', cursor: 'pointer' }}>Remember me for 30 days</label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: loading ? '#93C5FD' : 'linear-gradient(135deg, #0284C7, #0369A1)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '0.625rem',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        {/* Footer links */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #F1F5F9' }}>
          <p style={{ fontSize: '0.8125rem', color: '#94A3B8', marginBottom: '0.5rem' }}>
            Not a member yet?{' '}
            <Link to="/join" style={{ color: '#0284C7', textDecoration: 'none', fontWeight: 600 }}>Apply to join</Link>
          </p>
          <p style={{ fontSize: '0.75rem', color: '#CBD5E1', margin: 0 }}>
            Admin?{' '}
            <Link to="/admin/login" style={{ color: '#64748B', textDecoration: 'none' }}>Admin Login →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
