import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginRegister from './pages/LoginRegister.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EventCreate from './pages/EventCreate.jsx';
import EventDetail from './pages/EventDetail.jsx';

const isAuthed = () => Boolean(localStorage.getItem('token'));

function Protected({ children }) {
  if (!isAuthed()) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginRegister />} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/events/new" element={<Protected><EventCreate /></Protected>} />
      <Route path="/events/:id" element={<Protected><EventDetail /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
