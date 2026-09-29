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
    <nav className="w-full bg-espresso/95 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant">
      {/* Archival metadata bar */}
      <div className="border-b border-bronze/40 px-5 md:px-10 py-1.5 flex justify-between items-center">
        <div className="flex items-center gap-4 archival-text">
          <span>ARCHIVE VOL. 25 / ISSUE 08</span>
          <span className="hidden sm:inline text-outline-variant">/</span>
          <span className="hidden sm:inline">NEURAL APERTURE LABS</span>
        </div>
        <div className="flex items-center gap-2 archival-text">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-ochre animate-pulse" />
          <span className="text-ochre">EPHEMERAL RECOGNITION LIVE</span>
        </div>
      </div>

      {/* Main nav row */}
      <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 group flex-shrink-0">
          <div className="p-1.5 border border-outline-variant bg-surface group-hover:border-terracotta transition-colors duration-300">
            <svg className="w-5 h-5 text-terracotta" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl text-sand leading-none">GrabPic</span>
            <span className="font-space text-[9px] text-terracotta uppercase tracking-[0.3em] font-semibold mt-0.5">Neural Vision</span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            to="/dashboard"
            className={`px-3 py-1.5 font-space text-[12px] tracking-wider uppercase font-medium transition-all duration-200 ${
              isActive('/dashboard')
                ? 'text-sand border-b-2 border-terracotta'
                : 'text-muted hover:text-sand hover:border-b hover:border-muted-deep'
            }`}
          >
            Events
          </Link>
          <Link
            to="/events/new"
            className={`px-3 py-1.5 font-space text-[12px] tracking-wider uppercase font-medium transition-all duration-200 ${
              isActive('/events/new')
                ? 'text-sand border-b-2 border-terracotta'
                : 'text-muted hover:text-sand hover:border-b hover:border-muted-deep'
            }`}
          >
            Create
          </Link>
        </div>

        {/* Right: CTAs + User */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/events/new" className="btn-primary text-[11px] px-4 py-2 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Event
          </Link>

          <div className="h-4 w-px bg-outline-variant mx-1" />

          {/* User avatar + name */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full ring-2 ring-outline-variant hover:ring-terracotta transition-all overflow-hidden bg-surface-container-high flex items-center justify-center text-xs font-space font-semibold text-muted-darker">
              {initials}
            </div>
            <span className="text-sm text-on-surface-variant hidden lg:block font-space">{user?.name}</span>
            <button
              className="font-space text-[11px] tracking-wide uppercase text-muted hover:text-terracotta transition-colors"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-muted hover:text-sand transition-colors"
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
        <div className="md:hidden border-t border-outline-variant bg-espresso/98 backdrop-blur-xl animate-fade-in">
          <div className="px-5 py-4 space-y-1">
            <div className="flex items-center gap-3 pb-3 mb-3 border-b border-outline-variant">
              <div className="w-8 h-8 rounded-full ring-2 ring-outline-variant bg-surface-container-high flex items-center justify-center text-xs font-space font-semibold text-muted-darker">
                {initials}
              </div>
              <span className="text-sm text-on-surface-variant font-space">{user?.name}</span>
            </div>
            <Link
              to="/dashboard"
              className="block px-3 py-2 font-space text-xs tracking-wider uppercase text-on-surface-variant hover:text-sand hover:bg-surface-container transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Events
            </Link>
            <Link
              to="/events/new"
              className="block px-3 py-2 font-space text-xs tracking-wider uppercase text-on-surface-variant hover:text-sand hover:bg-surface-container transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Create Event
            </Link>
            <button
              className="w-full text-left px-3 py-2 font-space text-xs tracking-wider uppercase text-red-400 hover:bg-red-500/10 transition-colors"
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
