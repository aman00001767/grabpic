import api from './api';

export async function uploadEventPhotos(eventId, files, onProgress) {
  const form = new FormData();
  files.forEach((f) => form.append('files', f));
  const { data } = await api.post(`/upload-event-photos/${eventId}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    },
  });
  return data;
}

export async function findMe(eventId, file) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post(`/find-me/${eventId}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
