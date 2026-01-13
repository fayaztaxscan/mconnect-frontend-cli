// src/services/auth.js
import api, { setToken } from '@/services/api'

// POST /api/auth/login
export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password })

  // backend returns { token, user }
  if (data?.token) setToken(data.token)

  return data
}

// GET /api/auth/me (or /auth/me depending on your backend)
export async function me() {
  const { data } = await api.get('/auth/me')
  // Some backends return { user }, some return user directly
  return data?.user || data
}

// Client-side logout (no backend call required)
export function logout() {
  // If you have a backend logout endpoint you can call it,
  // but most JWT systems don’t need it.
  // Example (optional): api.post('/auth/logout').catch(() => {})
  setToken(null)
}
