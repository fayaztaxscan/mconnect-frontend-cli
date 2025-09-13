// src/services/uploads.js
import api from '@/services/api'

// Upload brand logo to POST /api/brands/upload
// Server returns: { url, key }
export async function uploadBrandLogo(file) {
  const fd = new FormData()
  fd.append('file', file) // ⬅️ field name MUST be "file"
  const { data } = await api.post('/brands/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data            // => { url, key }
}

