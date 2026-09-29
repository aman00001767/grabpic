import React, { useRef, useState, useCallback } from 'react';
import GoogleDriveIcon from './GoogleDriveIcon';

export default function UploadZone({
  onFiles,
  multiple = true,
  accept = 'image/*',
  uploading = false,
  progress = 0,
  label = 'Upload Photos',
  sublabel = 'Drag & drop or click to browse',
  icon = 'photo',
  onDriveClick = null,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileCount, setFileCount] = useState(0);

  const handleFiles = useCallback(
    (fileList) => {
      const files = Array.from(fileList || []);
      if (!files.length) return;
      setFileCount(files.length);
      onFiles?.(files);
    },
    [onFiles]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const icons = {
    photo: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Zm16.5-13.5h.008v.008h-.008V7.5Zm0 0a1.125 1.125 0 1 0-2.25 0 1.125 1.125 0 0 0 2.25 0Z" />
      </svg>
    ),
    selfie: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
  };

  return (
    <div
      className={`
        relative border-2 border-dashed p-8
        flex flex-col items-center justify-center gap-3
        cursor-pointer transition-all duration-300
        ${dragOver
          ? 'border-terracotta bg-terracotta/8 scale-[1.01]'
          : 'border-outline-variant hover:border-terracotta/50 hover:bg-surface-container'
        }
        ${uploading ? 'pointer-events-none opacity-70' : ''}
      `}
      onClick={() => !uploading && inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple={multiple}
        accept={accept}
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className={`transition-colors duration-300 ${dragOver ? 'text-terracotta' : 'text-muted'}`}>
        {icons[icon] || icons.photo}
      </div>

      <div className="text-center">
        <p className="font-space font-semibold text-sm tracking-wide text-sand">{label}</p>
        <p className="font-sans text-sm text-on-surface-variant mt-0.5">{sublabel}</p>
      </div>

      {fileCount > 0 && !uploading && (
        <p className="font-space text-xs tracking-widest uppercase text-terracotta mt-1">
          {fileCount} file{fileCount > 1 ? 's' : ''} selected
        </p>
      )}

      {onDriveClick && !uploading && (
        <div className="pt-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDriveClick();
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-space border border-outline-variant bg-surface hover:border-terracotta text-sand hover:text-white transition-colors"
          >
            <GoogleDriveIcon className="w-4 h-4" />
            <span>Or import from Google Drive</span>
          </button>
        </div>
      )}

      {uploading && (
        <div className="w-full max-w-xs mt-3">
          <div className="flex items-center justify-between font-space text-[11px] uppercase tracking-widest text-muted mb-1.5">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 bg-surface-container-high overflow-hidden">
            <div className="progress-fill h-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
