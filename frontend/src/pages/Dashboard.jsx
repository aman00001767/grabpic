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
    <div className="min-h-screen bg-espresso">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-5 py-8">
        {/* Stats banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-outline-variant mb-8 animate-fade-in border border-outline-variant">
          <div className="bg-espresso px-6 py-5">
            <p className="archival-text text-ochre mb-1">Total Events</p>
            <p className="font-display text-4xl text-sand">{loading ? '—' : events.length}</p>
          </div>
          <div className="bg-espresso px-6 py-5">
            <p className="archival-text text-ochre mb-1">Total Photos</p>
            <p className="font-display text-4xl text-sand">{loading ? '—' : totalPhotos}</p>
          </div>
          <div className="bg-espresso px-6 py-5 hidden sm:block">
            <p className="archival-text text-ochre mb-1">Welcome</p>
            <p className="font-display text-2xl text-sand truncate">{user?.name || 'User'}</p>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-outline-variant pb-4">
          <div>
            <p className="archival-text text-ochre mb-0.5">Archive</p>
            <h2 className="font-display text-2xl text-sand">Your Events</h2>
          </div>
          <Link to="/events/new" className="btn-primary flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Event
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
                className="editorial-card-hover p-5 animate-fade-in"
                style={{ animationDelay: `${0.05 * idx}s`, opacity: 0 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-space font-semibold text-sand truncate">{ev.title}</h3>
                    {ev.description && (
                      <p className="text-sm text-on-surface-variant mt-1 line-clamp-2 font-sans">{ev.description}</p>
                    )}
                  </div>
                  {ev.photo_count > 0 && (
                    <span className="flex-shrink-0 px-2.5 py-0.5 font-space text-xs font-semibold bg-surface-container border border-outline-variant text-ochre tracking-wide">
                      {ev.photo_count} photo{ev.photo_count !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-outline-variant">
                  <Link
                    to={`/events/${ev.id}`}
                    className="font-space text-xs tracking-wider uppercase font-semibold text-terracotta hover:text-terracotta-fixed transition-colors"
                  >
                    Open →
                  </Link>
                  <button
                    className="font-space text-xs tracking-wide uppercase text-muted hover:text-red-400 transition-colors ml-auto"
                    onClick={() => handleDelete(ev.id)}
                    disabled={deletingId === ev.id}
                  >
                    {deletingId === ev.id ? (
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 border-2 border-muted/30 border-t-muted rounded-full animate-spin" />
                        Deleting...
                      </span>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>

                {ev.created_at && (
                  <p className="archival-text mt-2">
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
