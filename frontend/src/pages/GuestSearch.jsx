import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import UploadZone from '../components/UploadZone.jsx';
import PhotoGrid from '../components/PhotoGrid.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useToast } from '../components/Toast.jsx';
import { fetchSharedEvent } from '../services/events';
import { findMePublic } from '../services/uploads';

export default function GuestSearch() {
  const { token } = useParams();
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searching, setSearching] = useState(false);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchSharedEvent(token);
        setEvent(data);
      } catch {
        setError('Invalid or expired share link.');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleSelfie = async (files) => {
    const file = files[0];
    if (!file) return;
    setSearching(true);
    setMatches([]);
    try {
      const data = await findMePublic(token, file);
      const m = data.matches || [];
      setMatches(m);
      if (m.length > 0) {
        toast.success(`Found ${m.length} photo${m.length !== 1 ? 's' : ''} of you!`);
      } else {
        toast.info('No matches found. Try a clearer photo.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading event..." />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 text-center max-w-md animate-scale-in">
          <svg className="w-14 h-14 text-surface-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <h2 className="text-lg font-semibold mb-2">Link Not Found</h2>
          <p className="text-sm text-surface-400 mb-5">{error}</p>
          <Link to="/" className="btn-primary">Go to GrabPic</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-6xl mx-auto px-5 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow-sm">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
          </div>
          <span className="text-lg font-bold gradient-text">GrabPic</span>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-5 py-8">
        <div className="text-center mb-10 animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{event.title}</h1>
          {event.description && (
            <p className="text-surface-400">{event.description}</p>
          )}
        </div>

        {/* Selfie upload */}
        <div className="max-w-md mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
          {searching ? (
            <div className="py-16">
              <LoadingSpinner size="lg" text="Searching for your face..." />
            </div>
          ) : (
            <>
              <UploadZone
                onFiles={handleSelfie}
                multiple={false}
                label="Upload a Selfie"
                sublabel="Take a clear photo of your face to find your event photos"
                icon="selfie"
              />
              <p className="text-xs text-surface-500 text-center mt-3">
                Your photo is processed securely and not stored.
              </p>
            </>
          )}
        </div>

        {/* Results */}
        {matches.length > 0 && (
          <div className="animate-fade-in-up">
            <h2 className="text-lg font-semibold mb-4">
              Found {matches.length} photo{matches.length !== 1 ? 's' : ''} of you
            </h2>
            <PhotoGrid photos={matches} showDistance />
          </div>
        )}

        {matches.length === 0 && !searching && (
          <div className="text-center text-surface-500 text-sm py-8">
            Upload a selfie above to find your photos from this event.
          </div>
        )}
      </div>
    </div>
  );
}
