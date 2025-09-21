// src/services/divisions.js
import api from '@/services/api' // baseURL '/api'

export const listDivisions = (params = {}) =>
  api.get('/divisions', { params }).then(r => r.data);

// ✅ match backend route: /api/divisions/by-brand/:brandId
export const listDivisionsByBrand = (brandId, params = {}) =>
  api.get(`/divisions/by-brand/${brandId}`, { params }).then(r => r.data);

export const getDivision = (id) =>
  api.get(`/divisions/${id}`).then(r => r.data);

export const createDivision = (payload) =>
  api.post('/divisions', payload).then(r => r.data);

export const updateDivision = (id, payload) =>
  api.put(`/divisions/${id}`, payload).then(r => r.data);

export const deleteDivision = (id) =>
  api.delete(`/divisions/${id}`).then(r => r.data);
