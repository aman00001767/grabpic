import React, { useState } from 'react';
import { uploadFromDrive } from '../services/uploads';
import LoadingSpinner from './LoadingSpinner';
import GoogleDriveIcon from './GoogleDriveIcon';

export { GoogleDriveIcon };
const GOOGLE_CLIENT_ID = import.meta.env.GOOGLE_CLIENT_ID || '';

export default function GoogleDriveUpload({ eventId, onUploadSuccess, onCancel }) {
  const [driveUrl, setDriveUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');

  // Handle URL import (folder or file links)
  const handleImportUrl = async (e) => {
    e?.preventDefault();
    if (!driveUrl.trim()) {
      setError('Please paste a Google Drive folder or photo link.');
      return;
    }

    setError('');
    setLoading(true);
    setStatusMessage('Connecting to Google Drive...');

    try {
      setStatusMessage('Downloading photos and extracting AI face embeddings...');
      const res = await uploadFromDrive(eventId, { drive_url: driveUrl.trim() });
      const count = res.count || res.uploaded?.length || 0;
      setStatusMessage(`Successfully imported ${count} photos!`);
      setDriveUrl('');
      onUploadSuccess?.(res);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
        'Failed to import from Google Drive. Please ensure the link is shared with "Anyone with the link".'
      );
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  // Handle interactive Google Drive Picker (if OAuth token / client available)
  const handleOpenPicker = () => {
    setError('');

    if (!window.google?.accounts?.oauth2) {
      setError('Google Identity Services library is not loaded. Please refresh the page or use the Drive link option.');
      return;
    }

    if (!GOOGLE_CLIENT_ID) {
      setError(
        'Google Client ID is not configured (GOOGLE_CLIENT_ID). You can import directly by pasting your Google Drive folder or photo link below!'
      );
      return;
    }

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            setError(`Google authorization error: ${tokenResponse.error}`);
            return;
          }

          const accessToken = tokenResponse.access_token;
          if (!window.gapi) {
            setError('Google API client is not loaded. Please use the Drive link option.');
            return;
          }

          window.gapi.load('picker', () => {
            try {
              const imageFolderView = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS_IMAGES)
                .setIncludeFolders(true)
                .setSelectFolderEnabled(true);

              const allFilesView = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
                .setIncludeFolders(true);

              const picker = new window.google.picker.PickerBuilder()
                .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
                .addView(imageFolderView)
                .addView(allFilesView)
                .setOAuthToken(accessToken)
                .setCallback(async (data) => {
                  if (data.action === window.google.picker.Action.PICKED) {
                    const docs = data.docs || [];
                    const fileIds = docs.map((d) => d.id);
                    if (!fileIds.length) return;

                    setLoading(true);
                    setStatusMessage(`Importing ${fileIds.length} item(s) from your Google Drive...`);
                    try {
                      const res = await uploadFromDrive(eventId, {
                        file_ids: fileIds,
                        access_token: accessToken,
                      });
                      const count = res.count || res.uploaded?.length || 0;
                      setStatusMessage(`Imported ${count} photos!`);
                      onUploadSuccess?.(res);
                    } catch (err) {
                      setError(err?.response?.data?.detail || 'Failed to import selected files from Google Drive');
                    } finally {
                      setLoading(false);
                      setStatusMessage('');
                    }
                  }
                })
                .build();

              picker.setVisible(true);
            } catch (pErr) {
              console.error(pErr);
              setError('Failed to open Google Picker. Please paste your Google Drive link below.');
            }
          });
        },
      });

      tokenClient.requestAccessToken({ prompt: '' });
    } catch (err) {
      console.error(err);
      setError('Could not initialize Google Drive Picker. Please use the link import option below.');
    }
  };

  return (
    <div className="editorial-card p-6 sm:p-8 space-y-6 border border-outline-variant bg-surface relative">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-outline-variant pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-surface-container border border-outline-variant rounded">
            <GoogleDriveIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-xl text-sand flex items-center gap-2">
              Import from Google Drive
            </h3>
            <p className="font-sans text-xs text-muted mt-0.5">
              Import event photo albums or individual images directly into this event
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="text-muted hover:text-sand text-xs font-space uppercase tracking-wider transition-colors px-2 py-1 border border-transparent hover:border-outline-variant"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Primary Method: Paste Shared Link */}
      <form onSubmit={handleImportUrl} className="space-y-4">
        <div>
          <label className="block font-space text-xs uppercase tracking-wider text-ochre mb-2 font-semibold">
            Google Drive Folder or Photo Link
          </label>
          <div className="relative">
            <input
              type="text"
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/1ABC... or file link"
              disabled={loading}
              className="input-field w-full pr-24 font-mono text-xs text-sand placeholder:text-muted/60"
            />
            {driveUrl && !loading && (
              <button
                type="button"
                onClick={() => setDriveUrl('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-sand text-xs font-space px-2 py-0.5"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Sharing instructions helper */}
        <div className="p-3 bg-surface-container border border-outline-variant flex items-start gap-2.5 text-xs text-muted leading-relaxed">
          <svg className="w-4 h-4 text-ochre flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
          <div>
            <span className="text-sand font-medium">Quick tip:</span> In Google Drive, right-click your folder or photo, click <strong className="text-ochre">Share</strong>, and set General access to <strong className="text-sand">"Anyone with the link"</strong> (Viewer). GrabPic will automatically extract all photos and generate AI face embeddings.
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800/60 text-red-200 text-xs font-sans flex items-start gap-2">
            <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Progress status */}
        {loading && (
          <div className="py-4 text-center space-y-2">
            <LoadingSpinner size="md" text={statusMessage || 'Processing Google Drive photos...'} />
            <p className="font-space text-[11px] uppercase tracking-wider text-muted">
              InsightFace AI is indexing faces in parallel
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || !driveUrl.trim()}
            className="btn-primary w-full sm:w-auto flex-1 flex items-center justify-center gap-2"
          >
            <GoogleDriveIcon className="w-4 h-4" />
            <span>{loading ? 'Importing Photos...' : 'Import from Drive Link'}</span>
          </button>

          {/* Interactive Picker Button */}
          <button
            type="button"
            onClick={handleOpenPicker}
            disabled={loading}
            className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2"
            title="Browse your Google Drive files interactively"
          >
            <GoogleDriveIcon className="w-4 h-4" />
            <span>Browse Google Drive</span>
          </button>
        </div>
      </form>
    </div>
  );
}
