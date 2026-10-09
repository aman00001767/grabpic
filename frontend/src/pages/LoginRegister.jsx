import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { login, register, googleAuth, forgotPassword } from '../services/auth';

// ── Replace with your actual Google OAuth Client ID ──────────────────────────
// Create one at: https://console.cloud.google.com → APIs & Services → Credentials
const GOOGLE_CLIENT_ID = import.meta.env.GOOGLE_CLIENT_ID || '';

const isAuthed = () => Boolean(localStorage.getItem('token'));

// ── Forgot Password Modal ─────────────────────────────────────────────────────
function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(15,10,8,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="editorial-card w-full max-w-sm p-7 animate-scale-in"
        style={{ border: '1px solid #3D322B' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="archival-text text-ochre mb-1">Account Recovery</p>
            <h2 className="font-display text-xl text-sand">Reset Password</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-muted hover:text-sand transition-colors border border-outline-variant hover:border-terracotta"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {sent ? (
          /* Success state */
          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full border border-ochre/30 bg-ochre/10">
              <svg className="w-6 h-6 text-ochre" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <p className="font-space text-sm text-sand mb-1">Check your inbox</p>
            <p className="text-sm text-on-surface-variant font-sans">
              If an account exists for <span className="text-ochre">{email}</span>, a password reset link has been sent.
            </p>
            <button onClick={onClose} className="btn-primary mt-6 w-full justify-center">
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <p className="text-sm text-on-surface-variant font-sans leading-relaxed">
              Enter your email and we'll send you a link to reset your password.
            </p>
            <div>
              <label className="block font-space text-[10px] tracking-widest uppercase text-muted-deep mb-1.5">
                Email address
              </label>
              <input
                className="input-field"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 border border-red-500/30 bg-red-500/8">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <p className="text-sm text-red-300 font-sans">{error}</p>
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-3 justify-center" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending…
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Main Login/Register page ──────────────────────────────────────────────────
export default function LoginRegister() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const googleBtnRef = useRef(null);
  const authed = isAuthed();

  // ── Google Identity Services init ──────────────────────────────────────────
  useEffect(() => {
    if (authed || !GOOGLE_CLIENT_ID || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
    });

    if (googleBtnRef.current) {
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'standard',
        shape: 'rectangular',
        theme: 'filled_black',
        text: 'continue_with',
        size: 'large',
        logo_alignment: 'left',
        width: googleBtnRef.current.offsetWidth || 340,
      });
    }
  }, [mode, authed]); // re-render button when tab switches

  // Must be after all hooks
  if (authed) return <Navigate to="/dashboard" replace />;

  const handleGoogleCredential = async (response) => {
    setError('');
    setGoogleLoading(true);
    try {
      const data = await googleAuth(response.credential);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // ── Email/password submit ──────────────────────────────────────────────────
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
    <>
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      <div className="min-h-screen bg-espresso flex items-center justify-center px-4 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-terracotta/5 rounded-full blur-3xl animate-float pointer-events-none" />

        <div className="relative z-10 w-full max-w-md animate-scale-in">
          {/* Logo */}
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="p-2 border border-outline-variant bg-surface group-hover:border-terracotta transition-colors duration-300">
                <svg className="w-5 h-5 text-terracotta" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-display text-2xl text-sand leading-none">GrabPic</span>
                <span className="font-space text-[9px] text-terracotta uppercase tracking-[0.3em] font-semibold mt-0.5">Neural Vision</span>
              </div>
            </Link>
          </div>

          {/* Card */}
          <div className="editorial-card p-7">
            {/* Archival overline */}
            <p className="archival-text text-ochre mb-5">
              {mode === 'login' ? 'Authenticate — Neural Access' : 'Register — New Account'}
            </p>

            {/* Mode tabs */}
            <div className="flex bg-surface-container border border-outline-variant p-1 mb-6">
              {['login', 'register'].map((m) => (
                <button
                  key={m}
                  className={`flex-1 py-2 font-space text-xs tracking-widest uppercase font-semibold transition-all duration-300 ${mode === m ? 'bg-terracotta text-white shadow-sm' : 'text-muted hover:text-sand'
                    }`}
                  onClick={() => { setMode(m); setError(''); }}
                  type="button"
                >
                  {m === 'login' ? 'Login' : 'Register'}
                </button>
              ))}
            </div>

            {/* ── Google Sign-In button ── */}
            <div className="mb-5">
              {GOOGLE_CLIENT_ID ? (
                <div className="relative">
                  {/* GSI rendered button (injected by Google SDK) */}
                  <div
                    ref={googleBtnRef}
                    id="google-signin-btn"
                    className="w-full overflow-hidden"
                    style={{ minHeight: 44 }}
                  />
                  {googleLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-espresso/70 rounded">
                      <span className="w-4 h-4 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                /* Placeholder shown when GOOGLE_CLIENT_ID is not yet set */
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-outline-variant bg-surface hover:border-terracotta/50 transition-colors duration-200 font-space text-xs tracking-wide text-sand"
                  onClick={() => setError('Set GOOGLE_CLIENT_ID in your .env to enable Google sign-in.')}
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-outline-variant" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-muted-darker">or continue with email</span>
              <div className="flex-1 h-px bg-outline-variant" />
            </div>

            {/* Email + password form */}
            <form onSubmit={submit} className="space-y-4">
              {mode === 'register' && (
                <div className="animate-fade-in">
                  <label className="block font-space text-[10px] tracking-widest uppercase text-muted-deep mb-1.5">Name</label>
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
                <label className="block font-space text-[10px] tracking-widest uppercase text-muted-deep mb-1.5">Email</label>
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-space text-[10px] tracking-widest uppercase text-muted-deep">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      className="font-space text-[9px] tracking-wide uppercase text-terracotta/70 hover:text-terracotta transition-colors"
                      onClick={() => setShowForgot(true)}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
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
                <div className="flex items-center gap-2 px-3 py-2 border border-red-500/30 bg-red-500/8 animate-fade-in">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                  <p className="text-sm text-red-300 font-sans">{error}</p>
                </div>
              )}

              <button type="submit" className="btn-primary w-full py-3 justify-center" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Please wait…
                  </span>
                ) : mode === 'login' ? (
                  'Sign in'
                ) : (
                  'Create account'
                )}
              </button>
            </form>
          </div>

          <p className="text-center font-space text-[11px] tracking-wider uppercase text-muted mt-6">
            <Link to="/" className="hover:text-terracotta transition-colors">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
