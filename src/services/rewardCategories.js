// src/services/rewardCategories.js
import api from '@/services/api';  

/**
 * Fetch all reward categories.
 */
export function getRewardCategories() {
  return api.get('/reward-categories');
}

/**
 * Fetch a single reward category by ID.
 * @param {number|string} id
 */
export function getRewardCategory(id) {
  return api.get(`/reward-categories/${id}`);
}

/**
 * Create a new reward category.
 * @param {{ name: string, description?: string }} data
 */
export function createRewardCategory(data) {
  return api.post('/reward-categories', data);
}

/**
 * Update an existing reward category by ID.
 * @param {number|string} id
 * @param {{ name: string, description?: string }} data
 */
export function updateRewardCategory(id, data) {
  return api.put(`/reward-categories/${id}`, data);
}

/**
 * Delete a reward category by ID.
 * @param {number|string} id
 */
export function deleteRewardCategory(id) {
  return api.delete(`/reward-categories/${id}`);
}
