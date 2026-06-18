import React, { useRef, useState, useCallback, useEffect } from 'react';

export default function CameraCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [facingMode, setFacingMode] = useState('user');
  const [flash, setFlash] = useState(false);

  const startCamera = useCallback(async (facing) => {
    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setReady(false);
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setReady(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleFlipCamera = () => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    startCamera(next);
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Trigger flash animation
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    // Mirror if using front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
          // Stop camera
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
          }
          onCapture?.(file);
        }
      },
      'image/jpeg',
      0.92
    );
  };

  const handleCancel = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    onCancel?.();
  };

  if (error) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-red-500/40 bg-red-500/5 p-8 text-center">
        <svg className="w-10 h-10 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
        </svg>
        <p className="text-sm text-red-300 mb-4">{error}</p>
        <button className="btn-secondary text-xs" onClick={handleCancel}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-surface-700/60 bg-black relative">
      {/* Camera viewfinder */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
        />

        {/* Flash overlay */}
        {flash && (
          <div className="absolute inset-0 bg-white z-20 animate-pulse" />
        )}

        {/* Face guide overlay */}
        {ready && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 border-white/30 shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]" />
          </div>
        )}

        {/* Loading state */}
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-900">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-400 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-surface-400">Starting camera...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 p-4 bg-surface-900/90">
        {/* Cancel */}
        <button
          className="p-3 rounded-full bg-surface-800/80 hover:bg-surface-700 text-surface-300 hover:text-white transition-colors"
          onClick={handleCancel}
          title="Cancel"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Capture button */}
        <button
          className="w-16 h-16 rounded-full bg-white hover:bg-surface-200 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl active:scale-90 disabled:opacity-50"
          onClick={handleCapture}
          disabled={!ready}
          title="Take photo"
        >
          <div className="w-12 h-12 rounded-full border-[3px] border-surface-900" />
        </button>

        {/* Flip camera */}
        <button
          className="p-3 rounded-full bg-surface-800/80 hover:bg-surface-700 text-surface-300 hover:text-white transition-colors"
          onClick={handleFlipCamera}
          title="Flip camera"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M2.985 19.644l3.181-3.183" />
          </svg>
        </button>
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hint text */}
      {ready && (
        <p className="text-xs text-surface-500 text-center py-2 bg-surface-900/90">
          Position your face in the circle and tap the capture button
        </p>
      )}
    </div>
  );
}
