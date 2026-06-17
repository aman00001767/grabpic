import React from 'react';

const illustrations = {
  'no-events': (
    <svg className="w-20 h-20 text-surface-600" fill="none" viewBox="0 0 24 24" strokeWidth={0.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  ),
  'no-photos': (
    <svg className="w-20 h-20 text-surface-600" fill="none" viewBox="0 0 24 24" strokeWidth={0.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
    </svg>
  ),
  'no-matches': (
    <svg className="w-20 h-20 text-surface-600" fill="none" viewBox="0 0 24 24" strokeWidth={0.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  ),
};

export default function EmptyState({ variant = 'no-events', title, message, action }) {
  const defaults = {
    'no-events': { title: 'No events yet', message: 'Create your first event to start uploading photos.' },
    'no-photos': { title: 'No photos uploaded', message: 'Upload event photos to enable face search.' },
    'no-matches': { title: 'No matches found', message: 'Try uploading a clearer selfie with good lighting.' },
  };

  const t = title || defaults[variant]?.title || 'Nothing here';
  const m = message || defaults[variant]?.message || '';

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 animate-fade-in">
      <div className="mb-5 opacity-50">{illustrations[variant] || illustrations['no-events']}</div>
      <h3 className="text-lg font-semibold text-surface-300 mb-1">{t}</h3>
      <p className="text-sm text-surface-500 max-w-xs text-center">{m}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
