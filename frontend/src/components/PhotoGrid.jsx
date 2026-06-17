import React, { useState } from 'react';
import Lightbox from './Lightbox.jsx';

export default function PhotoGrid({ photos = [], showDistance = false, onSelect, selectable = false, selectedIds = [] }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const lightboxImages = photos.map((p) => ({
    url: p.display_url || p.image_url,
    alt: `Photo ${p.photo_id || p.id}`,
    filename: `photo-${p.photo_id || p.id}.jpg`,
  }));

  const handleDownload = async (e, photo) => {
    e.stopPropagation();
    const photoId = photo.photo_id || photo.id;
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    try {
      // Use backend proxy to bypass S3 CORS restrictions
      const res = await fetch(`${apiBase}/photos/${photoId}/download`);
      if (!res.ok) throw new Error('proxy failed');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `grabpic-photo-${photoId}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch {
      // Fallback: open presigned URL in new tab
      const url = photo.display_url || photo.image_url;
      if (url) window.open(url, '_blank');
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {photos.map((photo, idx) => {
          const url = photo.display_url || photo.image_url;
          const photoId = photo.photo_id || photo.id;
          const isSelected = selectedIds.includes(photoId);

          return (
            <div
              key={`${photoId}-${idx}`}
              className={`
                group relative glass-card overflow-hidden cursor-pointer
                transition-all duration-300 hover:shadow-glow-sm
                ${isSelected ? 'ring-2 ring-brand-500 border-brand-500/50' : ''}
              `}
              onClick={() => setLightboxIndex(idx)}
            >
              <img
                src={url}
                alt={`Photo ${photoId}`}
                className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                  {showDistance && photo.distance != null && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      {Math.max(0, Math.round((1 - photo.distance) * 100))}% match
                    </span>
                  )}
                  <button
                    className="p-1.5 rounded-lg bg-surface-800/80 hover:bg-surface-700 text-surface-300 hover:text-white transition-colors ml-auto"
                    onClick={(e) => handleDownload(e, photo)}
                    title="Download"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Checkbox for selectable mode */}
              {selectable && (
                <button
                  className={`absolute top-2 right-2 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200
                    ${isSelected ? 'bg-brand-500 border-brand-500' : 'border-surface-400/50 bg-surface-800/50 opacity-0 group-hover:opacity-100'}
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect?.(photoId);
                  }}
                >
                  {isSelected && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
