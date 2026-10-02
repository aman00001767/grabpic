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
  const [eventToDelete, setEventToDelete] = useState(null);
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

  useEffect(() => {
    if (!eventToDelete) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !deletingId) {
        setEventToDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [eventToDelete, deletingId]);

  const confirmDelete = async () => {
    if (!eventToDelete || deletingId) return;
    const id = eventToDelete.id;
    setDeletingId(id);
    try {
      await deleteEvent(id);
      toast.success('Event deleted');
      setEventToDelete(null);
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
                    type="button"
                    className="font-space text-xs tracking-wide uppercase text-muted hover:text-red-400 transition-colors ml-auto cursor-pointer"
                    onClick={() => setEventToDelete(ev)}
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

      {/* Delete Confirmation Modal */}
      {eventToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-event-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget && !deletingId) {
              setEventToDelete(null);
            }
          }}
        >
          <div
            className="relative editorial-card p-6 sm:p-7 max-w-md w-full animate-scale-in border-l-4 border-red-500 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              className="absolute top-4 right-4 w-7 h-7 border border-outline-variant bg-surface-container flex items-center justify-center hover:border-red-400 text-muted hover:text-sand transition-colors cursor-pointer disabled:opacity-50"
              onClick={() => !deletingId && setEventToDelete(null)}
              disabled={Boolean(deletingId)}
              aria-label="Close"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div className="pr-6">
                <p className="archival-text text-red-400 mb-0.5">Confirm Deletion</p>
                <h3 id="delete-event-modal-title" className="font-display text-xl text-sand leading-snug">
                  Are you sure you want to delete this event?
                </h3>
              </div>
            </div>

            <p className="text-sm text-on-surface-variant mb-4 font-sans leading-relaxed">
              You are about to delete <span className="text-sand font-medium font-space">"{eventToDelete.title}"</span>
              {eventToDelete.photo_count > 0 ? (
                <> with all <span className="text-ochre font-medium font-space">{eventToDelete.photo_count} photo{eventToDelete.photo_count !== 1 ? 's' : ''}</span></>
              ) : null}. All facial recognition embeddings and guest access links will be permanently erased.
            </p>

            <div className="bg-surface-container border border-outline-variant p-3 mb-6 flex items-center gap-2 text-xs text-ochre font-space">
              <svg className="w-4 h-4 flex-shrink-0 text-ochre" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>This action cannot be undone.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-outline-variant">
              <button
                type="button"
                className="btn-secondary cursor-pointer"
                onClick={() => setEventToDelete(null)}
                disabled={Boolean(deletingId)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-5 py-2.5 font-space font-semibold text-xs tracking-widest uppercase bg-red-600 hover:bg-red-500 text-white transition-all shadow-glow active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer border border-red-500/30"
                onClick={confirmDelete}
                disabled={Boolean(deletingId)}
              >
                {deletingId === eventToDelete.id ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Event'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
