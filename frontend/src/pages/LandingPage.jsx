import React from 'react';
import { Link, Navigate } from 'react-router-dom';

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="absolute top-20 -left-32 w-72 h-72 bg-brand-500/8 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute top-40 -right-32 w-80 h-80 bg-purple-500/6 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '3s' }} />

      {/* Nav */}
      <header className="relative z-10 max-w-6xl mx-auto px-5 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
          </div>
          <span className="text-xl font-bold gradient-text">GrabPic</span>
        </div>
        <Link to="/login" className="btn-primary">
          Get Started
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-5 pt-20 pb-24 text-center">
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-sm text-brand-300 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            AI-Powered Photo Discovery
          </div>
        </div>

        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-fade-in-up"
          style={{ animationDelay: '0.2s', opacity: 0 }}
        >
          Find your photos
          <br />
          <span className="gradient-text">instantly with AI</span>
        </h1>

        <p
          className="text-lg sm:text-xl text-surface-400 max-w-2xl mx-auto mb-10 animate-fade-in-up"
          style={{ animationDelay: '0.35s', opacity: 0 }}
        >
          Upload event photos, take a selfie, and let our AI find every photo you're in.
          Perfect for weddings, conferences, and parties.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
          style={{ animationDelay: '0.5s', opacity: 0 }}
        >
          <Link to="/login" className="btn-primary text-base px-8 py-3">
            Start for Free →
          </Link>
          <a
            href="#features"
            className="btn-secondary text-base px-8 py-3"
          >
            How it works
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-5xl mx-auto px-5 py-20">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">How GrabPic Works</h2>
          <p className="text-surface-400 max-w-lg mx-auto">
            Three simple steps to find all your event photos
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <div
              key={f.title}
              className="glass-card-hover p-6 text-center animate-fade-in-up"
              style={{ animationDelay: `${0.15 * (idx + 1)}s`, opacity: 0 }}
            >
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-4 text-brand-400">
                {f.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-surface-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="relative z-10 max-w-4xl mx-auto px-5 py-16">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {[
            { num: '01', title: 'Create Event', desc: 'Set up your event in seconds' },
            { num: '02', title: 'Upload Photos', desc: 'Batch upload all event photos' },
            { num: '03', title: 'Take a Selfie', desc: 'AI finds every photo of you' },
          ].map((step, idx) => (
            <div
              key={step.num}
              className="animate-fade-in-up"
              style={{ animationDelay: `${0.2 * (idx + 1)}s`, opacity: 0 }}
            >
              <span className="text-4xl font-extrabold gradient-text opacity-40">{step.num}</span>
              <h3 className="font-semibold text-lg mt-2 mb-1">{step.title}</h3>
              <p className="text-sm text-surface-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-5 py-20 text-center">
        <div className="glass-card p-10 animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
          <h2 className="text-2xl font-bold mb-3">Ready to find your photos?</h2>
          <p className="text-surface-400 mb-6">Join GrabPic and never miss a moment from your events.</p>
          <Link to="/login" className="btn-primary text-base px-8 py-3">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-surface-800/40 py-6 text-center text-xs text-surface-600">
        © {new Date().getFullYear()} GrabPic. AI-powered event photo finder.
      </footer>
    </div>
  );
}
