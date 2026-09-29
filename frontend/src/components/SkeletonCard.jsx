import React from 'react';

export default function SkeletonCard({ variant = 'event-card', count = 1 }) {
  const cards = Array.from({ length: count }, (_, i) => i);

  if (variant === 'photo-card') {
    return (
      <>
        {cards.map((i) => (
          <div key={i} className="bg-espresso border border-outline-variant overflow-hidden">
            <div className="skeleton h-48 w-full" />
            <div className="p-3 space-y-2">
              <div className="skeleton h-2.5 w-2/3" />
              <div className="skeleton h-2.5 w-1/3" />
            </div>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {cards.map((i) => (
        <div key={i} className="editorial-card p-5 space-y-4">
          <div className="skeleton h-4 w-3/4" />
          <div className="space-y-2">
            <div className="skeleton h-2.5 w-full" />
            <div className="skeleton h-2.5 w-5/6" />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <div className="skeleton h-8 w-20" />
            <div className="skeleton h-8 w-16" />
          </div>
        </div>
      ))}
    </>
  );
}
