// src/services/uploads.js
import api from '@/services/api'

// Accept only common image types; keep in sync with server multer filter
const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const DEFAULT_MAX_BYTES = 2 * 1024 * 1024 // 2 MB (matches server limit)

const ASSET_BASE = (process.env.ASSET_BASE_URL || '').replace(/\/$/, ''); // http://localhost:3000

function publicUrl(rel) {
  const p = rel.startsWith('/uploads/') ? rel : '/uploads/' + rel.replace(/^\/+/, '');
  return ASSET_BASE ? ASSET_BASE + p : p;
}

function assertFile(file, { maxBytes = DEFAULT_MAX_BYTES, mimes = IMAGE_MIMES } = {}) {
  if (!(file instanceof File)) throw new Error('No file selected')
  if (file.size > maxBytes) throw new Error(`File too large. Max ${(maxBytes / (1024 * 1024)).toFixed(1)} MB`)
  if (mimes?.length && !mimes.includes(file.type)) throw new Error('Unsupported file type')
}

/**
 * Upload brand logo
 * Endpoint: POST /api/brands/upload
 * Field name: "file"
 * Response: { url, key }
 *
 * opts: { onProgress?: (ProgressEvent) => void, maxBytes?: number, mimes?: string[] }
 */
export async function uploadBrandLogo(file, opts = {}) {
  assertFile(file, opts)
  const fd = new FormData()
  fd.append('file', file) // MUST be "file" for brands endpoint
  const { data } = await api.post('/brands/upload', fd, {
    onUploadProgress: opts.onProgress
  })
  return data // { url, key }
}

/**
 * Upload product image
 * Endpoint: POST /api/products/:id/image
 * Field name: "image"
 * Response: { success: true, data: { id, image_url } }
 *
 * opts: { onProgress?: (ProgressEvent) => void, maxBytes?: number, mimes?: string[] }
 */
export async function uploadProductImage(productId, file, opts = {}) {
  assertFile(file, opts)
  const fd = new FormData()
  fd.append('image', file) // MUST be "image" for products endpoint
  const { data } = await api.post(`/products/${productId}/image`, fd, {
    onUploadProgress: opts.onProgress
  })
  return data // { success, data: { id, image_url } }
}

/**
 * Delete product image
 * Endpoint: DELETE /api/products/:id/image
 * Response: { success: true, data: { id, image_url: null } }
 */
export async function deleteProductImage(productId) {
  const { data } = await api.delete(`/products/${productId}/image`)
  return data
}

/**
 * Generic helper for other uploads
 * opts: { onProgress?: fn, maxBytes?: number, mimes?: string[] }
 */
export async function uploadTo(path, fieldName, file, extra = {}, opts = {}) {
  assertFile(file, opts)
  const fd = new FormData()
  fd.append(fieldName, file)
  for (const [k, v] of Object.entries(extra)) fd.append(k, v)
  const { data } = await api.post(path, fd, {
    onUploadProgress: opts.onProgress
  })
  return data
}
