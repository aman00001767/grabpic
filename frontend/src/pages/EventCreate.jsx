import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { createEvent } from '../services/events';
import { useToast } from '../components/Toast.jsx';

export default function EventCreate() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const event = await createEvent(form);
      toast.success('Event created!');
      navigate(`/events/${event.id}`);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="max-w-2xl mx-auto px-5 py-8">
        <h2 className="text-xl font-semibold mb-6">Create Event</h2>
        <div className="glass-card p-6 animate-fade-in">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Event Title</label>
              <input
                className="input-field"
                placeholder="e.g. Sarah's Wedding"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Description</label>
              <textarea
                className="input-field resize-none"
                placeholder="Optional description for your event"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
              />
            </div>
            <button className="btn-primary w-full py-3" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create Event'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
