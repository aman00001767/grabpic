import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '../components/Navbar.jsx';
import UploadZone from '../components/UploadZone.jsx';
import SelfieInput from '../components/SelfieInput.jsx';
import PhotoGrid from '../components/PhotoGrid.jsx';
import SkeletonCard from '../components/SkeletonCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import GoogleDriveUpload, { GoogleDriveIcon } from '../components/GoogleDriveUpload.jsx';
import { useToast } from '../components/Toast.jsx';
import { fetchEvent, fetchEventPhotos, createShareLink } from '../services/events';
import { uploadEventPhotos, findMe } from '../services/uploads';

export default function EventDetail() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  const [uploadSource, setUploadSource] = useState('local'); // 'local' | 'drive'
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [searching, setSearching] = useState(false);
  const [matches, setMatches] = useState([]);

  const [tab, setTab] = useState('gallery');
  const [shareUrl, setShareUrl] = useState('');
  const [sharingLoading, setSharingLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const loadEvent = async () => {
    setLoadingEvent(true);
    try {
      const data = await fetchEvent(id);
      setEvent(data);
    } catch {
      toast.error('Failed to load event');
    } finally {
      setLoadingEvent(false);
    }
  };

  const loadPhotos = async () => {
    setLoadingPhotos(true);
    try {
      const data = await fetchEventPhotos(id);
      setPhotos(data);
    } catch {
      setPhotos([]);
    } finally {
      setLoadingPhotos(false);
    }
  };

  useEffect(() => {
    loadEvent();
    loadPhotos();
  }, [id]);

  const handleUpload = async (files) => {
    if (!files.length) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const result = await uploadEventPhotos(id, files, setUploadProgress);
      const count = result?.uploaded?.length || 0;
      toast.success(`${count} photo${count !== 1 ? 's' : ''} uploaded!`);
      loadPhotos();
      loadEvent();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDriveSuccess = (result) => {
    const count = result?.count || result?.uploaded?.length || 0;
    toast.success(`Successfully imported ${count} photo${count !== 1 ? 's' : ''} from Google Drive!`);
    loadPhotos();
    loadEvent();
    setTab('gallery');
  };

  const handleSelfie = async (fileOrFiles) => {
    const file = fileOrFiles instanceof File ? fileOrFiles : fileOrFiles?.[0];
    if (!file) return;
    setSearching(true);
    setMatches([]);
    try {
      const data = await findMe(id, file);
      const m = data.matches || [];
      setMatches(m);
      if (m.length > 0) {
        toast.success(`Found ${m.length} photo${m.length !== 1 ? 's' : ''} of you!`);
        setTab('matches');
      } else {
        toast.info('No matches found. Try a clearer photo.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleShare = async () => {
    setSharingLoading(true);
    try {
      const data = await createShareLink(id);
      const url = `${window.location.origin}/events/share/${data.token}`;
      setShareUrl(url);
      setShowQR(true);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to create share link');
    } finally {
      setSharingLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('share-qr-code');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.download = `grabpic-${event?.title || 'event'}-qr.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const tabs = [
    { key: 'gallery', label: 'Gallery', count: photos.length },
    { key: 'upload', label: 'Upload' },
    { key: 'find', label: 'Find My Photos' },
    ...(matches.length > 0 ? [{ key: 'matches', label: 'Matches', count: matches.length }] : []),
  ];

  return (
    <div className="min-h-screen bg-espresso">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 animate-fade-in border-b border-outline-variant pb-5">
          <div>
            <Link to="/dashboard" className="font-space text-[11px] tracking-widest uppercase text-muted hover:text-terracotta transition-colors">
              ← Back to events
            </Link>
            <h2 className="font-display text-3xl text-sand mt-1">
              {loadingEvent ? <span className="skeleton inline-block h-8 w-48" /> : event?.title || 'Event'}
            </h2>
            {event?.description && (
              <p className="text-sm text-on-surface-variant mt-1 font-sans">{event.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="btn-secondary text-[11px] flex items-center gap-1.5" onClick={handleShare} disabled={sharingLoading}>
              {sharingLoading ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-muted/30 border-t-muted rounded-full animate-spin" />
                  Sharing...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                  </svg>
                  Share
                </span>
              )}
            </button>
          </div>
        </div>

        {/* QR Code Share Modal */}
        {showQR && shareUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowQR(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Modal */}
            <div
              className="relative editorial-card p-8 max-w-sm w-full text-center animate-scale-in border-l-4 border-terracotta"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-3 w-8 h-8 border border-outline-variant bg-surface-container flex items-center justify-center hover:border-terracotta transition-colors"
                onClick={() => setShowQR(false)}
              >
                <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>

              <p className="archival-text text-ochre mb-1">Share Event</p>
              <h3 className="font-display text-xl text-sand mb-1">Scan to Find Photos</h3>
              <p className="text-sm text-on-surface-variant mb-5 font-sans">
                From <span className="text-terracotta font-medium">{event?.title}</span>
              </p>

              {/* QR Code */}
              <div className="inline-block p-4 bg-white mb-5">
                <QRCodeSVG
                  id="share-qr-code"
                  value={shareUrl}
                  size={200}
                  level="H"
                  includeMargin={false}
                  fgColor="#120d0a"
                  bgColor="#ffffff"
                />
              </div>

              {/* Share link */}
              <div className="flex items-center gap-2 mb-4 bg-surface-container border border-outline-variant p-2">
                <code className="font-space text-xs text-terracotta flex-1 overflow-x-auto text-left whitespace-nowrap tracking-wide">
                  {shareUrl}
                </code>
                <button
                  className="btn-secondary text-[10px] py-1.5 px-3 flex-shrink-0"
                  onClick={handleCopyLink}
                >
                  Copy
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button className="btn-secondary text-[10px] flex-1" onClick={handleDownloadQR}>
                  <span className="flex items-center justify-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download QR
                  </span>
                </button>
                <button className="btn-primary text-[10px] flex-1" onClick={handleCopyLink}>
                  <span className="flex items-center justify-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-3.064a4.5 4.5 0 0 0-1.242-7.244l-4.5-4.5a4.5 4.5 0 0 0-6.364 6.364l1.757 1.757" />
                    </svg>
                    Copy Link
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-0 border border-outline-variant mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`flex items-center gap-1.5 px-5 py-3 font-space text-xs tracking-widest uppercase font-semibold whitespace-nowrap transition-all duration-200 border-r border-outline-variant last:border-r-0 ${
                tab === t.key
                  ? 'bg-terracotta text-white'
                  : 'text-muted hover:text-sand hover:bg-surface-container'
              }`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.count != null && t.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 font-space font-bold ${tab === t.key ? 'bg-white/20 text-white' : 'bg-ochre/20 text-ochre'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="animate-fade-in">
          {tab === 'gallery' && (
            <>
              {loadingPhotos ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  <SkeletonCard variant="photo-card" count={8} />
                </div>
              ) : photos.length === 0 ? (
                <EmptyState
                  variant="no-photos"
                  action={
                    <button className="btn-primary" onClick={() => setTab('upload')}>
                      Upload photos
                    </button>
                  }
                />
              ) : (
                <PhotoGrid photos={photos} />
              )}
            </>
          )}

          {tab === 'upload' && (
            <div className="max-w-xl mx-auto space-y-6">
              {/* Upload source selector */}
              <div className="flex items-center justify-center">
                <div className="inline-flex p-1 bg-surface-container border border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setUploadSource('local')}
                    className={`flex items-center gap-2 px-4 py-2 font-space text-xs uppercase tracking-wider transition-colors ${
                      uploadSource === 'local'
                        ? 'bg-surface text-sand shadow-sm border border-outline-variant font-semibold'
                        : 'text-muted hover:text-sand'
                    }`}
                  >
                    <svg className="w-4 h-4 text-terracotta" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    <span>Local Files</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadSource('drive')}
                    className={`flex items-center gap-2 px-4 py-2 font-space text-xs uppercase tracking-wider transition-colors ${
                      uploadSource === 'drive'
                        ? 'bg-surface text-sand shadow-sm border border-outline-variant font-semibold'
                        : 'text-muted hover:text-sand'
                    }`}
                  >
                    <GoogleDriveIcon className="w-4 h-4" />
                    <span>Google Drive</span>
                  </button>
                </div>
              </div>

              {uploadSource === 'local' ? (
                <>
                  <UploadZone
                    onFiles={handleUpload}
                    uploading={uploading}
                    progress={uploadProgress}
                    label="Upload Event Photos"
                    sublabel="Drag & drop images or click to browse (JPEG, PNG, WebP)"
                    icon="photo"
                    onDriveClick={() => setUploadSource('drive')}
                  />
                  <p className="font-space text-[11px] tracking-wide text-muted text-center mt-3 uppercase">
                    Photos are processed with AI to extract face embeddings for search.
                  </p>
                </>
              ) : (
                <GoogleDriveUpload
                  eventId={id}
                  onUploadSuccess={handleDriveSuccess}
                  onCancel={() => setUploadSource('local')}
                />
              )}
            </div>
          )}

          {tab === 'find' && (
            <div className="max-w-xl mx-auto">
              {searching ? (
                <div className="py-16">
                  <LoadingSpinner size="lg" text="Searching for your face..." />
                </div>
              ) : (
                <SelfieInput onFile={handleSelfie} />
              )}
            </div>
          )}

          {tab === 'matches' && (
            <>
              {matches.length === 0 ? (
                <EmptyState variant="no-matches" />
              ) : (
                <PhotoGrid photos={matches} showDistance />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
