// src/services/dealers.js
import api from '@/services/api' // your axios instance (or replace with axios)

export async function getDealer(id) {
  const { data } = await api.get(`/api/dealers/${id}`)
  return data
}

export async function createDealer(payload) {
  const { data } = await api.post('/api/dealers', payload)
  return data
}

export async function updateDealer(id, payload) {
  const { data } = await api.put(`/api/dealers/${id}`, payload)
  return data
}
