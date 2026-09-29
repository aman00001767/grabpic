import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import GrabPicDemoAnimation from '../components/GrabPicDemoAnimation';

const isAuthed = () => Boolean(localStorage.getItem('token'));

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
    title: 'AI Face Recognition',
    desc: 'Powered by state-of-the-art InsightFace AI to detect and match faces with incredible accuracy.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
    ),
    title: 'Instant Search',
    desc: 'Upload a selfie and find all your photos from an event in seconds. No more endless scrolling.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
      </svg>
    ),
    title: 'Share & Download',
    desc: 'Share event links with guests so everyone can find and download their own photos easily.',
  },
];

export default function LandingPage() {
  if (isAuthed()) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-espresso relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="absolute top-20 -left-32 w-72 h-72 bg-terracotta/5 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute top-40 -right-32 w-80 h-80 bg-ochre/4 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '3s' }} />

      {/* ── Landing Nav ── */}
      <header className="relative z-10 max-w-7xl mx-auto px-5 py-4">
        {/* Archival bar */}
        <div className="border-b border-outline-variant pb-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4 archival-text">
            <span>ARCHIVE VOL. 25 / ISSUE 08</span>
            <span className="hidden sm:inline text-outline-variant">/</span>
            <span className="hidden sm:inline">PROVENANCE: NEURAL APERTURE LABS</span>
          </div>
          <div className="flex items-center gap-2 archival-text">
            <span className="w-1.5 h-1.5 rounded-full bg-ochre animate-pulse" />
            <span className="text-ochre">EPHEMERAL RECOGNITION LIVE</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-1.5 border border-outline-variant bg-surface">
              <svg className="w-5 h-5 text-terracotta" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-2xl text-sand leading-none">GrabPic</span>
              <span className="font-space text-[9px] text-terracotta uppercase tracking-[0.3em] font-semibold mt-0.5">Neural Vision</span>
            </div>
          </div>

          <Link to="/login" className="btn-primary">
            Get Started
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 pt-12 pb-24">
        {/* Trust shield overline */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-y border-outline-variant py-3 mb-10 gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-ochre" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            <span className="font-space text-[11px] uppercase tracking-[0.25em] text-ochre font-bold">Zero-retention biometric privacy</span>
          </div>
          <div className="flex items-center gap-6 font-space text-[11px] uppercase tracking-[0.2em] text-muted-darker">
            <span>Instant edge matching</span>
            <span className="text-outline-variant">•</span>
            <span>High-res original downloads</span>
          </div>
        </div>

        {/* Two-column hero: headline left, demo animation right */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center border-b border-outline-variant pb-16">
          {/* Left: headline + CTAs */}
          <div>
            <div
              className="mb-8 animate-fade-in-up"
              style={{ animationDelay: '0.1s', opacity: 0 }}
            >
              <h1 className="font-display text-5xl sm:text-6xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-sand">
                Find your photos{' '}
                <span className="italic text-terracotta underline decoration-1 decoration-terracotta-dark underline-offset-8">
                  instantly with AI.
                </span>
              </h1>
            </div>

            <div
              className="animate-fade-in-up"
              style={{ animationDelay: '0.25s', opacity: 0 }}
            >
              <p className="font-sans text-base md:text-lg text-on-surface-variant font-light leading-relaxed mb-8">
                Event organizers upload high-res albums. Guests take a 2-second selfie to unlock every candid,
                stage, and celebration photo they appear in — instantly and privately.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link to="/login" className="btn-primary flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Create an Event
                </Link>
                <a href="#features" className="btn-secondary flex items-center gap-2">
                  Find My Photos
                </a>
              </div>
            </div>
          </div>

          {/* Right: Live demo animation */}
          <div
            className="flex justify-center animate-fade-in-up"
            style={{ animationDelay: '0.35s', opacity: 0 }}
          >
            <div className="w-full" style={{ maxWidth: 420 }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-darker">Live Demo</span>
              </div>
              <GrabPicDemoAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-5 py-20 border-b border-outline-variant">
        <div className="mb-12">
          <p className="archival-text text-ochre mb-2">How It Works</p>
          <h2 className="font-display text-3xl sm:text-4xl text-sand">Three steps to your photos</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-outline-variant">
          {features.map((f, idx) => (
            <div
              key={f.title}
              className="editorial-card-hover p-8 animate-fade-in-up bg-espresso"
              style={{ animationDelay: `${0.15 * (idx + 1)}s`, opacity: 0 }}
            >
              <div className="w-12 h-12 border border-outline-variant bg-surface-container flex items-center justify-center mb-5 text-terracotta">
                {f.icon}
              </div>
              <h3 className="font-space font-semibold text-base uppercase tracking-wide mb-2 text-sand">{f.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed font-sans">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 py-20 border-b border-outline-variant">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { num: '01', title: 'Create Event', desc: 'Set up your event in seconds' },
            { num: '02', title: 'Upload Photos', desc: 'Batch upload all event photos' },
            { num: '03', title: 'Take a Selfie', desc: 'AI finds every photo of you' },
          ].map((step, idx) => (
            <div
              key={step.num}
              className="animate-fade-in-up border-l-2 border-outline-variant pl-6 hover:border-terracotta transition-colors duration-300"
              style={{ animationDelay: `${0.2 * (idx + 1)}s`, opacity: 0 }}
            >
              <span className="font-display text-5xl text-terracotta/30">{step.num}</span>
              <h3 className="font-space font-semibold text-base uppercase tracking-wide mt-3 mb-1 text-sand">{step.title}</h3>
              <p className="text-sm text-on-surface-variant font-sans">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 py-20">
        <div
          className="editorial-card p-10 md:p-16 animate-fade-in-up border-l-4 border-terracotta"
          style={{ animationDelay: '0.3s', opacity: 0 }}
        >
          <p className="archival-text text-ochre mb-3">Ready to begin</p>
          <h2 className="font-display text-3xl sm:text-4xl text-sand mb-3">Find your photos from any event.</h2>
          <p className="text-on-surface-variant mb-8 max-w-lg font-sans">Join GrabPic and never miss a moment. Zero-retention biometric matching keeps your data private.</p>
          <Link to="/login" className="btn-primary inline-flex items-center gap-2">
            Get Started Free
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-outline-variant py-6 px-5 flex items-center justify-between">
        <p className="archival-text">© {new Date().getFullYear()} GrabPic. AI-powered event photo finder.</p>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
          <span className="archival-text text-terracotta">Neural Vision Active</span>
        </div>
      </footer>
    </div>
  );
}
