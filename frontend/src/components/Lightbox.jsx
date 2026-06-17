import React, { useState, useEffect, useCallback, useRef } from 'react';

export default function Lightbox({ images, initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex);
  const [animating, setAnimating] = useState(true);
  const backdropRef = useRef(null);

  const current = images[index];

  const goNext = useCallback(() => {
    if (index < images.length - 1) setIndex((i) => i + 1);
  }, [index, images.length]);

  const goPrev = useCallback(() => {
    if (index > 0) setIndex((i) => i - 1);
  }, [index]);

  const close = useCallback(() => {
    setAnimating(false);
    setTimeout(() => onClose?.(), 200);
  }, [onClose]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [close, goNext, goPrev]);

  const handleDownload = async () => {
    if (!current?.url) return;
    try {
      const res = await fetch(current.url, { mode: 'cors' });
      if (!res.ok) throw new Error('fetch failed');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = current.filename || `photo-${index + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch {
      // Fallback: open in new tab for manual save (CORS-blocked S3 URLs)
      window.open(current.url, '_blank');
    }
  };

  return (
    <div
      ref={backdropRef}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md transition-opacity duration-200 ${animating ? 'opacity-100' : 'opacity-0'}`}
      onClick={(e) => e.target === backdropRef.current && close()}
    >
      {/* Close button */}
      <button
        className="absolute top-5 right-5 z-10 p-2 rounded-full bg-surface-800/60 hover:bg-surface-700 text-surface-300 hover:text-white transition-colors"
        onClick={close}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Counter */}
      <div className="absolute top-5 left-5 z-10 px-3 py-1.5 rounded-full bg-surface-800/60 text-xs text-surface-300">
        {index + 1} / {images.length}
      </div>

      {/* Download button */}
      <button
        className="absolute top-5 right-16 z-10 p-2 rounded-full bg-surface-800/60 hover:bg-surface-700 text-surface-300 hover:text-white transition-colors"
        onClick={handleDownload}
        title="Download"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      </button>

      {/* Previous */}
      {index > 0 && (
        <button
          className="absolute left-4 z-10 p-3 rounded-full bg-surface-800/60 hover:bg-surface-700 text-surface-300 hover:text-white transition-all"
          onClick={goPrev}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
      )}

      {/* Next */}
      {index < images.length - 1 && (
        <button
          className="absolute right-4 z-10 p-3 rounded-full bg-surface-800/60 hover:bg-surface-700 text-surface-300 hover:text-white transition-all"
          onClick={goNext}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      )}

      {/* Image */}
      <img
        key={current?.url}
        src={current?.url}
        alt={current?.alt || `Photo ${index + 1}`}
        className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl animate-scale-in select-none"
        draggable={false}
      />
    </div>
  );
}
