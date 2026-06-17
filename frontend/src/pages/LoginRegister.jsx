import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { login, register } from '../services/auth';

const isAuthed = () => Boolean(localStorage.getItem('token'));

export default function LoginRegister() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthed()) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = mode === 'login' ? await login(form) : await register(form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="absolute top-1/3 -left-40 w-80 h-80 bg-brand-500/8 rounded-full blur-3xl animate-float pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow duration-300">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
            </div>
            <span className="text-2xl font-bold gradient-text">GrabPic</span>
          </Link>
        </div>

        {/* Card */}
        <div className="glass-card p-7">
          {/* Mode tabs */}
          <div className="flex bg-surface-800/60 rounded-xl p-1 mb-6">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                mode === 'login'
                  ? 'bg-brand-500/20 text-brand-300 shadow-sm'
                  : 'text-surface-400 hover:text-surface-300'
              }`}
              onClick={() => toggleMode()}
              type="button"
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                mode === 'register'
                  ? 'bg-brand-500/20 text-brand-300 shadow-sm'
                  : 'text-surface-400 hover:text-surface-300'
              }`}
              onClick={() => toggleMode()}
              type="button"
            >
              Register
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <div className="animate-fade-in">
                <label className="block text-xs font-medium text-surface-400 mb-1.5">Name</label>
                <input
                  className="input-field"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Email</label>
              <input
                className="input-field"
                placeholder="you@example.com"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Password</label>
              <input
                className="input-field"
                placeholder="••••••••"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 animate-fade-in">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Please wait...
                </span>
              ) : mode === 'login' ? (
                'Sign in'
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-surface-500 mt-6">
          <Link to="/" className="text-surface-400 hover:text-brand-400 transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
