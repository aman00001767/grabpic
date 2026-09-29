import api from './api';

export async function register(payload) {
  const { data } = await api.post('/register', payload);
  return data;
}

export async function login(payload) {
  const { data } = await api.post('/login', payload);
  return data;
}

export async function googleAuth(credential) {
  const { data } = await api.post('/auth/google', { credential });
  return data;
}

export async function forgotPassword(email) {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
}
