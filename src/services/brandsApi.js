// src/services/brandsApi.js
import api from '@/services/api';

// baseURL already includes /api → use plain resource paths

export async function listBrands({ q = '', active = '' } = {}) {
  const { data } = await api.get('/brands', { params: { q, active } });
  return data;
}

export async function getBrand(id) {
  const { data } = await api.get(`/brands/${id}`);
  return data;
}

export async function createBrand(payload) {
  const { data } = await api.post('/brands', payload);
  return data;
}

export async function updateBrand(id, payload) {
  const { data } = await api.put(`/brands/${id}`, payload);
  return data;
}

export async function deleteBrand(id) {
  const { data } = await api.delete(`/brands/${id}`);
  return data;
}
