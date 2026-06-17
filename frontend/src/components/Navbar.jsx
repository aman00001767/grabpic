import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const initials = (user?.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="w-full border-b border-surface-800/60 bg-surface-950/70 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow duration-300">
            <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
          </div>
          <span className="text-lg font-bold gradient-text">GrabPic</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/dashboard"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
              isActive('/dashboard') ? 'text-brand-400 bg-brand-500/10' : 'text-surface-400 hover:text-surface-200'
            }`}
          >
            Events
          </Link>
          <Link
            to="/events/new"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
              isActive('/events/new') ? 'text-brand-400 bg-brand-500/10' : 'text-surface-400 hover:text-surface-200'
            }`}
          >
            Create
          </Link>

          <div className="w-px h-6 bg-surface-800 mx-2" />

          {/* User */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500/30 to-brand-700/30 border border-brand-500/20 flex items-center justify-center text-xs font-semibold text-brand-300">
              {initials}
            </div>
            <span className="text-sm text-surface-400 hidden lg:block">{user?.name}</span>
            <button
              className="px-3 py-1.5 rounded-lg text-sm text-surface-400 hover:text-surface-200 hover:bg-surface-800/60 transition-colors"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-surface-800/60 text-surface-400 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-surface-800/60 bg-surface-950/95 backdrop-blur-xl animate-fade-in">
          <div className="px-5 py-4 space-y-1">
            <div className="flex items-center gap-3 pb-3 mb-3 border-b border-surface-800/60">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500/30 to-brand-700/30 border border-brand-500/20 flex items-center justify-center text-xs font-semibold text-brand-300">
                {initials}
              </div>
              <span className="text-sm text-surface-300">{user?.name}</span>
            </div>
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-lg text-sm text-surface-300 hover:bg-surface-800/60"
              onClick={() => setMenuOpen(false)}
            >
              Events
            </Link>
            <Link
              to="/events/new"
              className="block px-3 py-2 rounded-lg text-sm text-surface-300 hover:bg-surface-800/60"
              onClick={() => setMenuOpen(false)}
            >
              Create Event
            </Link>
            <button
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
