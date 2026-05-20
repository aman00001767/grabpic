import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { fetchEvents } from '../services/events';
import { uploadEventPhotos, findMe } from '../services/uploads';

export default function EventDetail() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [event, setEvent] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searching, setSearching] = useState(false);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  const loadEvent = async () => {
    const events = await fetchEvents();
    const found = events.find((e) => String(e.id) === String(id));
    setEvent(found || null);
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setUploadProgress(0);
    setError('');
    try {
      await uploadEventPhotos(id, files, setUploadProgress);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSelfie = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSearching(true);
    setError('');
    setMatches([]);
    try {
      const data = await findMe(id, file);
      setMatches(data.matches || []);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/dashboard" className="text-sm text-slate-400">← Back to events</Link>
            <h2 className="text-xl font-semibold mt-2">{event?.title || 'Event'}</h2>
            <p className="text-sm text-slate-400">{event?.description}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded">
            <h3 className="font-semibold mb-2">Upload Event Photos</h3>
            <input type="file" multiple accept="image/*" onChange={handleUpload} />
            {uploading && (
              <div className="mt-3 text-sm text-slate-300">Uploading... {uploadProgress}%</div>
            )}
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded">
            <h3 className="font-semibold mb-2">Upload Selfie to Find Matches</h3>
            <input type="file" accept="image/*" onChange={handleSelfie} />
            {searching && <div className="mt-3 text-sm text-slate-300">Searching...</div>}
          </div>
        </div>

        {error && <p className="text-red-400 mt-4">{error}</p>}

        <div className="mt-8">
          <h3 className="font-semibold mb-3">Matched Photos</h3>
          {matches.length === 0 ? (
            <p className="text-slate-400">No matches yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map((m, idx) => (
                <div key={`${m.image_url}-${idx}`} className="bg-slate-900 border border-slate-800 rounded overflow-hidden">
                  <img src={m.image_url} alt="Match" className="w-full h-48 object-cover" />
                  <div className="p-3 text-xs text-slate-400">Distance: {m.distance?.toFixed(3)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
