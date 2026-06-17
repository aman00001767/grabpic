import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import SkeletonCard from '../components/SkeletonCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { fetchEvents, deleteEvent } from '../services/events';
import { useToast } from '../components/Toast.jsx';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await deleteEvent(id);
      toast.success('Event deleted');
      load();
    } catch {
      toast.error('Failed to delete event');
    } finally {
      setDeletingId(null);
    }
  };

  const totalPhotos = events.reduce((acc, ev) => acc + (ev.photo_count || 0), 0);

  return (
    <div className="min-h-screen">
      <Navbar user={user} />

      <div className="max-w-6xl mx-auto px-5 py-8">
        {/* Stats banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8 animate-fade-in">
          <div className="glass-card px-5 py-4">
            <p className="text-xs text-surface-500 uppercase tracking-wider font-medium">Events</p>
            <p className="text-2xl font-bold mt-1">{loading ? '—' : events.length}</p>
          </div>
          <div className="glass-card px-5 py-4">
            <p className="text-xs text-surface-500 uppercase tracking-wider font-medium">Photos</p>
            <p className="text-2xl font-bold mt-1">{loading ? '—' : totalPhotos}</p>
          </div>
          <div className="glass-card px-5 py-4 hidden sm:block">
            <p className="text-xs text-surface-500 uppercase tracking-wider font-medium">Welcome</p>
            <p className="text-lg font-semibold mt-1 truncate">{user?.name || 'User'}</p>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Your Events</h2>
          <Link to="/events/new" className="btn-primary">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create Event
            </span>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            <SkeletonCard variant="event-card" count={4} />
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            variant="no-events"
            action={
              <Link to="/events/new" className="btn-primary">
                Create your first event
              </Link>
            }
          />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {events.map((ev, idx) => (
              <div
                key={ev.id}
                className="glass-card-hover p-5 animate-fade-in"
                style={{ animationDelay: `${0.05 * idx}s`, opacity: 0 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-surface-100 truncate">{ev.title}</h3>
                    {ev.description && (
                      <p className="text-sm text-surface-400 mt-1 line-clamp-2">{ev.description}</p>
                    )}
                  </div>
                  {ev.photo_count > 0 && (
                    <span className="flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-500/10 text-brand-300 border border-brand-500/20">
                      {ev.photo_count} photo{ev.photo_count !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-surface-800/60">
                  <Link
                    to={`/events/${ev.id}`}
                    className="text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    Open →
                  </Link>
                  <button
                    className="text-sm text-surface-500 hover:text-red-400 transition-colors ml-auto"
                    onClick={() => handleDelete(ev.id)}
                    disabled={deletingId === ev.id}
                  >
                    {deletingId === ev.id ? (
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 border-2 border-surface-500/30 border-t-surface-400 rounded-full animate-spin" />
                        Deleting...
                      </span>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>

                {ev.created_at && (
                  <p className="text-xs text-surface-600 mt-2">
                    {new Date(ev.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
