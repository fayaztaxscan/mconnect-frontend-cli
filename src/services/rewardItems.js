// src/services/rewardItems.js
import api from '@/services/api';

/**
 * Fetch all reward items (active only).
 */
export function getRewardItems() {
  return api.get('/reward-items');
}

/**
 * Fetch a single reward item by ID.
 */
export function getRewardItem(id) {
  return api.get(`/reward-items/${id}`);
}

/**
 * Create a new reward item.
 * data shape: { name, reward_category_id, points_required, market_mrp, available_stock, status }
 */
export function createRewardItem(data) {
  return api.post('/reward-items', data);
}

/**
 * Update existing reward item.
 */
export function updateRewardItem(id, data) {
  return api.put(`/reward-items/${id}`, data);
}

/**
 * Delete a reward item.
 */
export function deleteRewardItem(id) {
  return api.delete(`/reward-items/${id}`);
}
