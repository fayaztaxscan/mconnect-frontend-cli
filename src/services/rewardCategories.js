// src/services/rewardCategories.js
import api from '@/services/api';  

/**
 * Fetch all reward categories.
 */
export function getRewardCategories() {
  return api.get('/reward-categories');
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
 * @param {number} id
 * @param {{ name: string, description?: string }} data
 */
export function updateRewardCategory(id, data) {
  return api.put(`/reward-categories/${id}`, data);
}

/**
 * Delete a reward category by ID.
 * @param {number} id
 */
export function deleteRewardCategory(id) {
  return api.delete(`/reward-categories/${id}`);
}
