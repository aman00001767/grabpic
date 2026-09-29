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
          className={`${sizes[size]} rounded-full border-2 border-outline-variant border-t-terracotta animate-spin`}
        />
        <div
          className={`absolute inset-0 ${sizes[size]} rounded-full border-2 border-transparent border-b-ochre/30 animate-spin-slow`}
        />
      </div>
      {text && (
        <p className="font-space text-[11px] tracking-widest uppercase text-muted animate-pulse">{text}</p>
      )}
    </div>
  );
}
