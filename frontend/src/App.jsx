import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import LoginRegister from './pages/LoginRegister.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EventCreate from './pages/EventCreate.jsx';
import EventDetail from './pages/EventDetail.jsx';
import GuestSearch from './pages/GuestSearch.jsx';

const isAuthed = () => Boolean(localStorage.getItem('token'));

function Protected({ children }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginRegister />} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/events/new" element={<Protected><EventCreate /></Protected>} />
      <Route path="/events/share/:token" element={<GuestSearch />} />
      <Route path="/events/:id" element={<Protected><EventDetail /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
