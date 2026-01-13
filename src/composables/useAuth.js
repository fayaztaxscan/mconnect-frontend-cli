// src/composables/useAuth.js
import { ref, computed } from 'vue'
import { login as apiLogin, me as apiMe, logout as apiLogout } from '@/services/auth'

/**
 * Normalizes user shape across backend variants.
 * - Ensures role_name exists (some APIs return `role`, some `role_name`)
 * - Keeps a stable shape for router guards and UI
 */
function normalizeUser(u) {
  if (!u || typeof u !== 'object') return null

  // clone to avoid mutating original response object
  const user = { ...u }

  // Backward/forward compatibility
  if (!user.role_name && user.role) user.role_name = user.role
  if (!user.role && user.role_name) user.role = user.role_name

  // Optional: keep a convenient uppercase version (doesn't break existing code)
  user.role_name_upper = String(user.role_name || '').toUpperCase()

  return user
}

function safeGetLS(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetLS(key, val) {
  try {
    localStorage.setItem(key, val)
  } catch {
    /* ignore */
  }
}

function safeRemoveLS(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

// Bootstrap user from localStorage (helps guards immediately on refresh)
const currentUser = ref(null)
try {
  const raw = safeGetLS('user')
  if (raw) currentUser.value = normalizeUser(JSON.parse(raw))
} catch {
  // bad JSON -> clear
  safeRemoveLS('user')
  currentUser.value = null
}

const isLoggedIn = computed(() => !!safeGetLS('token'))

async function hydrate() {
  // If no token, ensure clean state
  if (!safeGetLS('token')) {
    currentUser.value = null
    safeRemoveLS('user')
    return null
  }

  try {
    const me = await apiMe()
    const normalized = normalizeUser(me)
    currentUser.value = normalized

    // Keep localStorage user in sync (router/LoginView checks rely on it)
    safeSetLS('user', JSON.stringify(normalized))
    return normalized
  } catch (e) {
    // token invalid/expired or /me failed
    safeRemoveLS('token')
    safeRemoveLS('user')
    currentUser.value = null
    return null
  }
}

async function login(email, password) {
  const resp = await apiLogin(email, password) // apiLogin stores token already
  const normalized = normalizeUser(resp?.user || null)

  currentUser.value = normalized
  safeSetLS('user', JSON.stringify(normalized))

  return normalized
}

function logout() {
  try {
    apiLogout() // should remove token (depends on your auth service)
  } finally {
    // Hard clear to be safe
    safeRemoveLS('token')
    safeRemoveLS('user')
    currentUser.value = null
  }
}

export function useAuth() {
  return { currentUser, isLoggedIn, hydrate, login, logout }
}
