// src/services/retailSignupRequests.js
import api from '@/services/api'

export async function listSignupRequests(status = 'pending') {
  const res = await api.get('/retail-signup/requests', { params: { status } })
  return res.data?.data || []
}

export async function approveSignupRequest(id, payload) {
  const res = await api.post(`/retail-signup/requests/${id}/approve`, payload)
  return res.data
}

export async function rejectSignupRequest(id, reason) {
  const res = await api.post(`/retail-signup/requests/${id}/reject`, { reason })
  return res.data
}
