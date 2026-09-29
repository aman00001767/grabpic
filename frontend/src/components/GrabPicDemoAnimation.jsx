import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
  Upload, ScanFace, CheckCircle2, Download, Zap,
  Camera, Search, Sparkles, ChevronRight
} from 'lucide-react';

// The selfie subject — same person referenced in all match results
const SUBJECT_ID = '1534528741775-53994a69daeb';

const SELFIE_URL =
  `https://images.unsplash.com/photo-${SUBJECT_ID}?w=200&h=200&fit=crop&crop=face&auto=format`;

// The small face thumbnail shown as overlay on each match card
const FACE_THUMB =
  `https://images.unsplash.com/photo-${SUBJECT_ID}?w=60&h=60&fit=crop&crop=face&auto=format`;

// Group/event photos — AI-generated, each features the matched person
// among other people in different real-world settings
const MATCH_PHOTOS = [
  { url: '/demo/match1.jpg', score: 99.2, label: 'Tech Conference' },
  { url: '/demo/match2.jpg', score: 97.8, label: 'After Party' },
  { url: '/demo/match3.jpg', score: 96.1, label: 'Outdoor Lunch' },
  { url: '/demo/match4.jpg', score: 94.5, label: 'Gala Dinner' },
  { url: '/demo/match5.jpg', score: 93.0, label: 'Main Stage' },
  { url: '/demo/match6.jpg', score: 91.7, label: 'Panel Discussion' },
];

// ─── Step timing (ms) ───────────────────────────────────────────────────────
const STEP_DURATIONS = [2800, 2700, 3200, 1300];
const TOTAL = STEP_DURATIONS.reduce((a, b) => a + b, 0);

// ─── Reusable spring preset ─────────────────────────────────────────────────
const spring = { type: 'spring', stiffness: 300, damping: 25 };
const springFast = { type: 'spring', stiffness: 400, damping: 30 };

// ─── Step 1: Upload ─────────────────────────────────────────────────────────
function StepUpload() {
  return (
    <motion.div
      key="upload"
      className="flex flex-col items-center justify-center h-full gap-5 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4 }}
    >
      {/* Drop zone */}
      <motion.div
        className="w-full max-w-xs border-2 border-dashed rounded-lg p-6 flex flex-col items-center gap-3 text-center relative overflow-hidden"
        style={{ borderColor: '#3D322B', background: 'rgba(35,29,25,0.7)' }}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...spring, delay: 0.1 }}
      >
        <motion.div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(200,109,81,0.12)' }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Camera size={22} style={{ color: '#C86D51' }} />
        </motion.div>
        <p className="font-space text-xs uppercase tracking-widest" style={{ color: '#A39081' }}>
          Drop your selfie or snap a photo
        </p>
        <p className="font-mono text-[10px]" style={{ color: '#5a4a40' }}>
          JPEG · PNG · WEBP supported
        </p>
      </motion.div>

      {/* Selfie flying in */}
      <motion.div
        className="relative"
        initial={{ scale: 0.4, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.5 }}
      >
        <div
          className="w-20 h-20 rounded-full overflow-hidden border-2"
          style={{ borderColor: '#C86D51' }}
        >
          <img
            src={SELFIE_URL}
            alt="Selfie"
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        </div>
        {/* Glowing ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: '#C86D51' }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        />
      </motion.div>

      {/* Detection badge */}
      <motion.div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-[10px]"
        style={{ background: 'rgba(200,109,81,0.15)', border: '1px solid rgba(200,109,81,0.4)', color: '#C86D51' }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <ScanFace size={11} />
        Target face detected: 1 Face · 99.4% confidence
      </motion.div>
    </motion.div>
  );
}

// ─── Step 2: Scanning ────────────────────────────────────────────────────────
function StepScanning() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 2200;
    const raf = () => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(100, (elapsed / duration) * 100));
      if (elapsed < duration) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, []);

  return (
    <motion.div
      key="scanning"
      className="flex flex-col items-center justify-center h-full gap-5 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4 }}
    >
      {/* Reference photo (docked) with scan beam */}
      <motion.div
        className="relative rounded-lg overflow-hidden"
        style={{ width: 90, height: 90, border: '2px solid #C86D51' }}
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ ...spring, delay: 0.1 }}
      >
        <img
          src={SELFIE_URL}
          alt="Reference"
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
        />
        {/* Scan beam */}
        <motion.div
          className="absolute inset-x-0 h-[3px] rounded-full"
          style={{
            background:
              'linear-gradient(90deg, transparent, #C86D51, #D99B43, #C86D51, transparent)',
            boxShadow: '0 0 12px 4px rgba(200,109,81,0.7)',
          }}
          animate={{ top: ['-4px', 'calc(100% + 4px)'] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear', delay: 0.4 }}
        />
        {/* Corner brackets */}
        {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
          <div
            key={i}
            className={`absolute w-3 h-3 ${pos}`}
            style={{
              borderTop: i < 2 ? '2px solid #D99B43' : 'none',
              borderBottom: i >= 2 ? '2px solid #D99B43' : 'none',
              borderLeft: i % 2 === 0 ? '2px solid #D99B43' : 'none',
              borderRight: i % 2 === 1 ? '2px solid #D99B43' : 'none',
            }}
          />
        ))}
      </motion.div>

      {/* Radar indicator */}
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ background: '#C86D51' }}
          animate={{ scale: [1, 1.6, 1], opacity: [1, 0.3, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
        <span className="font-mono text-[11px]" style={{ color: '#A39081' }}>
          Searching 1,420 event photos...
        </span>
      </motion.div>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ background: '#3D322B' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #C86D51, #D99B43)',
              width: `${progress}%`,
              boxShadow: '0 0 8px rgba(200,109,81,0.6)',
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-mono text-[9px]" style={{ color: '#5a4a40' }}>
            {Math.round(progress)}%
          </span>
          <span className="font-mono text-[9px]" style={{ color: '#5a4a40' }}>
            {progress < 100 ? 'MATCHING…' : 'DONE'}
          </span>
        </div>
      </div>

      {/* Scattered animated dots grid */}
      <div className="grid grid-cols-8 gap-1">
        {Array.from({ length: 24 }).map((_, i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#3D322B' }}
            animate={{
              background: ['#3D322B', '#C86D51', '#3D322B'],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: (i * 0.08) % 1.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Step 3: Results ─────────────────────────────────────────────────────────
const gridVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};
const cardVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 12 },
  show: { opacity: 1, scale: 1, y: 0, transition: spring },
};

function StepResults() {
  return (
    <motion.div
      key="results"
      className="flex flex-col h-full gap-3 px-2 pt-2 pb-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4 }}
    >
      {/* Status bar */}
      <motion.div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-[10px] mx-auto"
        style={{
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.35)',
          color: '#4ade80',
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...springFast }}
      >
        <CheckCircle2 size={11} />
        Found 6 matching photos in 0.42s!
      </motion.div>

      {/* Photo grid */}
      <motion.div
        className="grid grid-cols-3 gap-1.5 flex-1"
        variants={gridVariants}
        initial="hidden"
        animate="show"
      >
        {MATCH_PHOTOS.map((photo, i) => (
          <motion.div
            key={i}
            className="relative rounded-md overflow-hidden group"
            style={{ aspectRatio: '3/4', border: '1px solid #3D322B' }}
            variants={cardVariants}
          >
            {/* Group event photo */}
            <img
              src={photo.url}
              alt={`Event photo ${i + 1}`}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
            {/* Bottom gradient */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(27,22,19,0.9) 0%, transparent 55%)',
              }}
            />
            {/* Top-left: matched face thumbnail with glowing ring */}
            <motion.div
              className="absolute top-1 left-1"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1, ...spring }}
            >
              <div
                className="relative w-6 h-6 rounded-full overflow-hidden"
                style={{
                  border: '1.5px solid #C86D51',
                  boxShadow: '0 0 6px rgba(200,109,81,0.8)',
                }}
              >
                <img
                  src={FACE_THUMB}
                  alt="Matched face"
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              </div>
              {/* Pulsing ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: '1.5px solid #C86D51' }}
                animate={{ scale: [1, 1.6], opacity: [0.7, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut', delay: i * 0.15 }}
              />
            </motion.div>
            {/* Event label top-right */}
            <motion.div
              className="absolute top-1 right-1 px-1 py-0.5 rounded font-mono text-[7px]"
              style={{
                background: 'rgba(27,22,19,0.75)',
                backdropFilter: 'blur(4px)',
                color: '#A39081',
                border: '1px solid #3D322B',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 + i * 0.08 }}
            >
              {photo.label}
            </motion.div>
            {/* Match score badge */}
            <motion.div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full font-mono text-[8px] whitespace-nowrap"
              style={{
                background: 'rgba(200,109,81,0.9)',
                color: '#F5EBE1',
                boxShadow: '0 0 6px rgba(200,109,81,0.6)',
              }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              {photo.score}% match
            </motion.div>
            {/* Download icon */}
            <motion.div
              className="absolute bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded flex items-center justify-center"
              style={{ background: 'rgba(27,22,19,0.75)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.08 }}
            >
              <Download size={9} style={{ color: '#D99B43' }} />
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

// ─── Step 4: Reset / Outro ───────────────────────────────────────────────────
function StepReset() {
  return (
    <motion.div
      key="reset"
      className="flex flex-col items-center justify-center h-full gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, ease: 'linear', repeat: Infinity }}
      >
        <Sparkles size={28} style={{ color: '#C86D51' }} />
      </motion.div>
      <p className="font-display text-xl" style={{ color: '#F5EBE1' }}>
        Restarting demo…
      </p>
    </motion.div>
  );
}

// ─── Step indicator pills ─────────────────────────────────────────────────────
const STEP_LABELS = ['Upload', 'Scan', 'Match', 'Reset'];
const STEP_ICONS = [Upload, Search, CheckCircle2, Zap];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 pt-3 pb-1 flex-wrap">
      {STEP_LABELS.map((label, i) => {
        const Icon = STEP_ICONS[i];
        const active = i === current;
        const done = i < current;
        return (
          <React.Fragment key={label}>
            <motion.div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[9px] uppercase tracking-wide"
              animate={{
                background: active
                  ? 'rgba(200,109,81,0.2)'
                  : done
                  ? 'rgba(200,109,81,0.07)'
                  : 'rgba(61,50,43,0.3)',
                borderColor: active ? '#C86D51' : done ? '#C86D5180' : '#3D322B',
                color: active ? '#C86D51' : done ? '#8a5f4f' : '#5a4a40',
              }}
              style={{ border: '1px solid' }}
              transition={{ duration: 0.3 }}
            >
              <Icon size={8} />
              {i + 1}. {label}
            </motion.div>
            {i < STEP_LABELS.length - 1 && (
              <ChevronRight size={10} style={{ color: '#3D322B' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Browser chrome wrapper ───────────────────────────────────────────────────
function BrowserChrome({ children }) {
  return (
    <div
      className="rounded-xl overflow-hidden shadow-2xl w-full"
      style={{
        background: '#1B1613',
        border: '1px solid #3D322B',
        boxShadow: '0 0 60px rgba(200,109,81,0.08), 0 24px 60px rgba(0,0,0,0.6)',
        maxWidth: 420,
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b"
        style={{ background: '#231D19', borderColor: '#3D322B' }}
      >
        <div className="flex gap-1.5">
          {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <div
          className="flex-1 mx-3 px-3 py-1 rounded font-mono text-[9px] flex items-center gap-2"
          style={{ background: '#1B1613', color: '#5a4a40', border: '1px solid #3D322B' }}
        >
          <span style={{ color: '#C86D51' }}>●</span>
          grabpic.app / search
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[8px]" style={{ color: '#5a4a40' }}>
          <Zap size={8} style={{ color: '#D99B43' }} />
          LIVE
        </div>
      </div>

      {/* Content area */}
      <div className="relative" style={{ height: 340 }}>
        {children}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function GrabPicDemoAnimation() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStep((s) => (s + 1) % 4);
    }, STEP_DURATIONS[step]);
    return () => clearTimeout(timer);
  }, [step]);

  const stepContent = [
    <StepUpload key="upload" />,
    <StepScanning key="scanning" />,
    <StepResults key="results" />,
    <StepReset key="reset" />,
  ];

  return (
    <div className="flex flex-col items-center select-none">
      <BrowserChrome>
        <AnimatePresence mode="wait">
          {stepContent[step]}
        </AnimatePresence>
      </BrowserChrome>

      <div
        className="w-full rounded-b-xl pb-2 px-2"
        style={{
          background: '#1B1613',
          border: '1px solid #3D322B',
          borderTop: 'none',
          maxWidth: 420,
        }}
      >
        <StepIndicator current={step} />
      </div>
    </div>
  );
}
