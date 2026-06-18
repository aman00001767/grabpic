import React, { useState } from 'react';
import UploadZone from './UploadZone.jsx';
import CameraCapture from './CameraCapture.jsx';

/**
 * SelfieInput – gives the user the choice to either take a live selfie
 * via their device camera or upload an existing photo from their gallery.
 *
 * Props:
 *   onFile(file: File) – called with the captured or selected file
 */
export default function SelfieInput({ onFile }) {
  // 'choose' | 'camera' | 'upload'
  const [mode, setMode] = useState('choose');

  const handleCameraCapture = (file) => {
    setMode('choose');
    onFile?.(file);
  };

  const handleUploadFiles = (files) => {
    if (files[0]) {
      setMode('choose');
      onFile?.(files[0]);
    }
  };

  if (mode === 'camera') {
    return (
      <CameraCapture
        onCapture={handleCameraCapture}
        onCancel={() => setMode('choose')}
      />
    );
  }

  if (mode === 'upload') {
    return (
      <div>
        <UploadZone
          onFiles={handleUploadFiles}
          multiple={false}
          label="Upload a Photo"
          sublabel="Choose a clear, well-lit photo of your face"
          icon="selfie"
        />
        <button
          className="mt-3 text-xs text-surface-500 hover:text-brand-400 transition-colors w-full text-center"
          onClick={() => setMode('choose')}
        >
          ← Back to options
        </button>
      </div>
    );
  }

  // Default: show the two options
  return (
    <div className="space-y-3">
      {/* Take a Selfie */}
      <button
        className="w-full rounded-2xl border-2 border-dashed border-surface-700/60 hover:border-brand-500/40 hover:bg-surface-800/40 p-6 flex items-center gap-4 transition-all duration-300 group cursor-pointer text-left"
        onClick={() => setMode('camera')}
      >
        <div className="w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-500/25 transition-colors">
          <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-surface-200 group-hover:text-white transition-colors">Take a Selfie</p>
          <p className="text-sm text-surface-500 mt-0.5">Use your camera to capture a photo</p>
        </div>
        <svg className="w-5 h-5 text-surface-600 group-hover:text-brand-400 ml-auto transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Upload a Photo */}
      <button
        className="w-full rounded-2xl border-2 border-dashed border-surface-700/60 hover:border-brand-500/40 hover:bg-surface-800/40 p-6 flex items-center gap-4 transition-all duration-300 group cursor-pointer text-left"
        onClick={() => setMode('upload')}
      >
        <div className="w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-500/25 transition-colors">
          <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-surface-200 group-hover:text-white transition-colors">Upload a Photo</p>
          <p className="text-sm text-surface-500 mt-0.5">Choose an existing photo from your device</p>
        </div>
        <svg className="w-5 h-5 text-surface-600 group-hover:text-brand-400 ml-auto transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      <p className="text-xs text-surface-500 text-center mt-1">
        For best results, use a well-lit, front-facing photo.
      </p>
    </div>
  );
}
