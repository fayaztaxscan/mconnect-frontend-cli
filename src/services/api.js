// src/services/api.js
import axios from 'axios'
// If you have a router, you can import it and prefer SPA redirects.
// import router from '@/router'

/**
 * Vue CLI / Webpack friendly base URL resolution (no import.meta).
 * Priority:
 *  1) window.__API_BASE__  (optional runtime-injected)
 *  2) process.env.VUE_APP_API_URL (Vue CLI env)
 *  3) same-origin '/api'
 */
const API_BASE =
  (typeof window !== 'undefined' && window.__API_BASE__) ||
  process.env.VUE_APP_API_URL ||
  '/api'

const instance = axios.create({
  baseURL: API_BASE,
  withCredentials: false, // using Bearer tokens, not cookies
  timeout: 20000,
  headers: {
    Accept: 'application/json'
    // Don't set 'Content-Type' globally; let Axios infer (esp. for FormData)
  }
})

// --- Token helpers -----------------------------------------------------------
export function getToken() {
  try { return localStorage.getItem('token') } catch { return null }
}
export function setToken(token) {
  try {
    if (!token) localStorage.removeItem('token')
    else localStorage.setItem('token', token)
  } catch { /* ignore */ }
}

// Attach Bearer token on each request
instance.interceptors.request.use(config => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`

  // Append region_id for admin region filtering
  try {
    const { useRegionStore } = require('@/store/regionStore')
    const regionStore = useRegionStore()
    if (regionStore.selectedRegionId) {
      const url = config.url || ''
      if (url.includes('/products') || url.includes('/reward-items')) {
        config.params = config.params || {}
        if (!config.params.region_id) {
          config.params.region_id = regionStore.selectedRegionId
        }
      }
    }
  } catch (_) {}

  return config
})

// Global response handling
instance.interceptors.response.use(
  resp => resp,
  err => {
    const status = err?.response?.status

    if (status === 401) {
      // Token invalid/expired → clear and go to login (avoid loop)
      setToken(null)
      const onLogin = typeof window !== 'undefined' && window.location.pathname.includes('/login')
      if (!onLogin) {
        try {
          // Prefer router if available:
          // router?.push?.({ name: 'Login' })
          window.location.href = '/login'
        } catch {
          window.location.href = '/login'
        }
      }
    } else if (status === 403) {
      console.warn('Forbidden:', err?.response?.data?.message || 'Insufficient permissions')
    } else if (status === 422) {
      // Let callers consume field errors
    } else if (!status) {
      // Network / CORS / timeout (no HTTP status)
      console.error('Network error or timeout contacting API', err?.message)
    }

    return Promise.reject(err)
  }
)

export default instance
