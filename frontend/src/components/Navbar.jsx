import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="w-full border-b border-slate-800 bg-slate-950/70 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="text-lg font-semibold">Event Photo Finder</Link>
        <div className="flex items-center gap-4 text-sm text-slate-300">
          <span>{user?.name}</span>
          <button className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700" onClick={logout}>Logout</button>
        </div>
      </div>
    </div>
  );
}
