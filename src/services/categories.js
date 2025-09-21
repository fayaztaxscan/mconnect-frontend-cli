import api from '@/services/api' // keep this if your axios instance is at src/services/api.js
// If your file is at src/api.js, change to: import api from '@/api'

export const listCategories = (params = {}) =>
  api.get('/categories', { params }).then(r => r.data);

// ✅ FIX: match backend route mounted at /api/categories
export const listCategoriesByDivision = (divisionId, params = {}) =>
  api.get(`/categories/division/${divisionId}`, { params }).then(r => r.data);

export const getCategory = (id) =>
  api.get(`/categories/${id}`).then(r => r.data);

export const createCategory = (payload) =>
  api.post('/categories', payload).then(r => r.data);

export const updateCategory = (id, payload) =>
  api.put(`/categories/${id}`, payload).then(r => r.data);

export const deleteCategory = (id) =>
  api.delete(`/categories/${id}`).then(r => r.data);

export const restoreCategory = (id) =>
  api.post(`/categories/${id}/restore`).then(r => r.data);

// Aliases (if your store uses fetch* names)
export const fetchCategories = listCategories;
export const fetchCategory   = getCategory;
