import api, { apiPublic } from './api';

export async function fetchEvents() {
  const { data } = await api.get('/events');
  return data;
}

export async function fetchEvent(eventId) {
  const { data } = await api.get(`/events/${eventId}`);
  return data;
}

export async function fetchEventPhotos(eventId) {
  const { data } = await api.get(`/events/${eventId}/photos`);
  return data;
}

export async function createEvent(payload) {
  const { data } = await api.post('/events', payload);
  return data;
}

export async function deleteEvent(eventId) {
  const { data } = await api.delete(`/events/${eventId}`);
  return data;
}

export async function createShareLink(eventId) {
  const { data } = await api.post(`/events/${eventId}/share`);
  return data;
}

export async function fetchSharedEvent(token) {
  const { data } = await apiPublic.get(`/share/${token}`);
  return data;
}
