// src/services/auth.js
import api from '@/services/api';

// baseURL already includes /api → use plain paths

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  // Save token so your interceptor adds Authorization on subsequent requests
  localStorage.setItem('token', data.token);
  return data; // { token, user }
}

export async function me() {
  const { data } = await api.get('/auth/me'); // requires Authorization header (interceptor handles it)
  return data; // { id, email, display_name, role_id, ... }
}

export function logout() {
  localStorage.removeItem('token');
}
