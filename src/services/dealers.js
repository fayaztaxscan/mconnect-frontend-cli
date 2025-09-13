// src/services/dealers.js
import api from '@/services/api'

export async function listDealers(params = {}) {
  const { data } = await api.get('/dealers', { params })   // ← no /api
  return Array.isArray(data) ? data : (data.items ?? [])
}

export async function getDealer(id)    { return (await api.get(`/dealers/${id}`)).data }
export async function createDealer(p)  { return (await api.post('/dealers', p)).data }
export async function updateDealer(id,p){return (await api.put(`/dealers/${id}`, p)).data }
export async function deleteDealer(id) { return (await api.delete(`/dealers/${id}`)).data }
