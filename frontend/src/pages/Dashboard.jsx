import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { fetchEvents, deleteEvent } from '../services/events';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await fetchEvents();
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    await deleteEvent(id);
    load();
  };

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Your Events</h2>
          <Link to="/events/new" className="px-4 py-2 rounded bg-indigo-500 hover:bg-indigo-400">Create Event</Link>
        </div>
        {loading ? (
          <div className="text-slate-400">Loading...</div>
        ) : events.length === 0 ? (
          <div className="text-slate-400">No events yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {events.map((ev) => (
              <div key={ev.id} className="p-4 bg-slate-900 border border-slate-800 rounded">
                <h3 className="font-semibold">{ev.title}</h3>
                <p className="text-sm text-slate-400 mb-3">{ev.description}</p>
                <div className="flex items-center gap-3">
                  <Link to={`/events/${ev.id}`} className="text-indigo-300">Open</Link>
                  <button className="text-red-400" onClick={() => handleDelete(ev.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
