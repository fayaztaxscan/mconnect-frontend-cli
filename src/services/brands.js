// src/services/brands.js
import api from './api';

/**
 * GET /brands
 * @param {Object} params optional filters/sort/pagination (e.g., { q, page, limit, sortBy, sortDir, active })
 * @returns {Promise<any>} usually an array, or a paginated object if your backend paginates
 */
export async function listBrands(params = {}) {
  const { data } = await api.get('/brands', { params });
  // Unwrap your current shape { items: [...] }
  if (data && Array.isArray(data.items)) return data.items;
  // Fallbacks for other shapes we might encounter elsewhere
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

/**
 * GET /brands/:id
 */
export async function getBrand(id) {
  const { data } = await api.get(`/brands/${id}`);
  return data;
}

/**
 * POST /brands
 * Accepts either:
 *  - plain JSON object (name, description, active, image_url, etc.)
 *  - FormData (for inline image upload under field 'logo' if your route supports it)
 */
export async function createBrand(payload) {
  if (payload instanceof FormData) {
    const { data } = await api.post('/brands', payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  }
  const { data } = await api.post('/brands', payload);
  return data;
}

/**
 * PUT /brands/:id
 * Accepts either JSON or FormData (same semantics as createBrand).
 */
export async function updateBrand(id, payload) {
  if (payload instanceof FormData) {
    const { data } = await api.put(`/brands/${id}`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  }
  const { data } = await api.put(`/brands/${id}`, payload);
  return data;
}

/**
 * DELETE /brands/:id
 */
export async function deleteBrand(id) {
  const { data } = await api.delete(`/brands/${id}`);
  return data;
}

/**
 * POST /brands/upload
 * Helper to upload an image and get back a public URL/key.
 * Usage:
 *   const { url, key } = await uploadBrandImage(file);
 */
export async function uploadBrandImage(file) {
  const fd = new FormData();
  fd.append('file', file);
  const { data } = await api.post('/brands/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data; // { url, key }
}

// Optional default export for convenience
export default {
  listBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
  uploadBrandImage,
};
