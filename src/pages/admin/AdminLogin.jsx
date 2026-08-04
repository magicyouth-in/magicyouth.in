import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

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
    } catch (err) {
      setError('An error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070114] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full bg-purple-700/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand logo & header */}
        <div className="text-center mb-8">
          <img
            src="/assets/magic-logo.png"
            alt="MAGIC Youth Logo"
            className="w-20 h-20 mx-auto rounded-full border-2 border-purple-500/30 object-cover drop-shadow-[0_0_30px_rgba(124,58,237,0.3)] mb-4"
          />
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            MAGIC YOUTH
          </h1>
          <p className="text-xs text-purple-400 font-semibold uppercase tracking-wider mt-1">
            Administrator Portal
          </p>
        </div>

        {/* Login form card */}
        <div className="dark-glass-card p-8 border border-purple-500/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-purple-300 mb-1.5 uppercase tracking-wider">
                Email / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-purple-400/60 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@magicyouth.in"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-purple-500/25 text-white text-xs placeholder-purple-300/30 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-purple-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-purple-400/60 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-purple-500/25 text-white text-xs placeholder-purple-300/30 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-purple-200/70 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-purple-500/30 bg-slate-950/80 text-purple-600 focus:ring-purple-500 h-4 w-4"
                />
                <span>Remember Me</span>
              </label>

              <button
                type="button"
                onClick={() => alert('Forgot Password placeholder. Please contact the database administrator or update using the seed script.')}
                className="text-purple-400 hover:text-purple-300 font-medium transition"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-purple-glow font-bold text-sm py-3.5 rounded-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-xs text-purple-400/70 hover:text-purple-300 transition">
            ← Back to Public Website
          </a>
        </div>
      </div>
    </div>
  );
}
