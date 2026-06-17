import React from 'react';

export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <div
          className={`${sizes[size]} rounded-full border-2 border-surface-700 border-t-brand-500 animate-spin`}
        />
        <div
          className={`absolute inset-0 ${sizes[size]} rounded-full border-2 border-transparent border-b-brand-400/30 animate-spin-slow`}
        />
      </div>
      {text && <p className="text-sm text-surface-400 animate-pulse">{text}</p>}
    </div>
  );
}
