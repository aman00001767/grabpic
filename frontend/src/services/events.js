import api from './api';

export async function fetchEvents() {
  const { data } = await api.get('/events');
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
