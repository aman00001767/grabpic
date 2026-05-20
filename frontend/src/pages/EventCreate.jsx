import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { createEvent } from '../services/events';

export default function EventCreate() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const event = await createEvent(form);
      navigate(`/events/${event.id}`);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold mb-4">Create Event</h2>
        <form onSubmit={submit} className="space-y-4">
          <input
            className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
            placeholder="Event title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button className="px-4 py-2 rounded bg-indigo-500 hover:bg-indigo-400" disabled={loading}>
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
}
