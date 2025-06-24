// src/services/rewardItems.js
import api from '@/services/api';

/**
 * Fetch reward items, with optional filters.
 * @param {Object} [params] – Query params, e.g. { status, reward_category_id, page, limit }
 */
export function getRewardItems(params = {}) {
  return api.get('/reward-items', { params });
}

/**
 * Fetch a single reward item by ID.
 * @param {string|number} id
 */
export function getRewardItem(id) {
  return api.get(`/reward-items/${id}`);
}

/**
 * Create a new reward item.
 * @param {Object} data
 * @param {string} data.name
 * @param {number} data.reward_category_id
 * @param {number} data.points_required
 * @param {number} data.market_mrp
 * @param {number} data.available_stock
 * @param {string} data.status
 * @param {string} [data.image_url]
 */
export function createRewardItem(data) {
  return api.post('/reward-items', data);
}

/**
 * Update an existing reward item.
 * @param {string|number} id
 * @param {Object} data – Fields to update
 */
export function updateRewardItem(id, data) {
  return api.put(`/reward-items/${id}`, data);
}

/**
 * Delete a reward item.
 * @param {string|number} id
 */
export function deleteRewardItem(id) {
  return api.delete(`/reward-items/${id}`);
}

export default {
  getRewardItems,
  getRewardItem,
  createRewardItem,
  updateRewardItem,
  deleteRewardItem,
};
