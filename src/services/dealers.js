// src/services/dealers.js
import api from '@/services/api'

// Detect FormData without relying on instanceof across frames
function isFormData(x) {
  return x && typeof x === 'object' && typeof x.append === 'function' && x[Symbol.toStringTag] === 'FormData'
}

// Convert a plain object to FormData (skip null/undefined; stringify non-files)
function toFormData(obj) {
  const fd = new FormData()
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v === null || v === undefined) return
    // Allow File/Blob to pass through (e.g., logo)
    if (typeof File !== 'undefined' && v instanceof File) {
      fd.append(k, v)
    } else if (typeof Blob !== 'undefined' && v instanceof Blob) {
      fd.append(k, v)
    } else {
      fd.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v))
    }
  })
  return fd
}

/**
 * Get dealers list with filters/pagination.
 * Backend returns:
 *   { data: [], page, limit, total, pages, sortBy, sortDir, q, filters }
 * If your backend still returns an array (legacy), we normalize it.
 */
export async function listDealers(params = {}) {
  const { data } = await api.get('/dealers', { params })
  if (Array.isArray(data)) {
    // Legacy fallback → wrap into paginated shape
    return {
      data,
      page: 1,
      limit: data.length,
      total: data.length,
      pages: 1,
      sortBy: 'created_at',
      sortDir: 'desc',
      q: params?.q ?? null,
      filters: {
        status: params?.status ?? null,
        city: params?.city ?? null,
        country: params?.country ?? null,
      },
    }
  }
  return data
}

/** Get one dealer by id */
export async function getDealer(id) {
  const { data } = await api.get(`/dealers/${id}`)
  return data
}

/**
 * Create dealer
 * - Accepts either FormData (recommended for logo upload) or a plain object.
 * - If plain object is passed, we convert to FormData to support file uploads later without changing callers.
 */
export async function createDealer(payload) {
  const body = isFormData(payload) ? payload : toFormData(payload)
  const { data } = await api.post('/dealers', body)
  return data
}

/**
 * Update dealer
 * - Same FormData behavior as createDealer.
 */
export async function updateDealer(id, payload) {
  const body = isFormData(payload) ? payload : toFormData(payload)
  const { data } = await api.put(`/dealers/${id}`, body)
  return data
}

/**
 * Delete dealer
 * - Backend returns 204 No Content.
 */
export async function deleteDealer(id) {
  await api.delete(`/dealers/${id}`)
  return true
}

/**
 * Convenience helper if some lists still expect a plain array.
 * Mirrors old behavior by returning only the array portion of the response.
 */
export async function listDealersArray(params = {}) {
  const res = await listDealers(params)
  return Array.isArray(res) ? res : res.data
}
