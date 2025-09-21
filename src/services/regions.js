// src/services/regions.js
import api from '@/services/api'
export async function listRegions() {
  const { data } = await api.get('/regions')
  // Normalize to [{ id, name }]
  return Array.isArray(data) ? data.map(r => ({ id: r.id, name: r.name })) : (data.data || [])
}
