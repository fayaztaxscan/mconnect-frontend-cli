// src/services/products.js
import api from '@/services/api'

/**
 * Upload product image (field name MUST be "image")
 * @param {number|string} id
 * @param {File|Blob} file
 * @returns {Promise<any>}
 */
export function uploadProductImage(id, file) {
  const form = new FormData();
  form.append('image', file);
  return api.post(`/products/${id}/image`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);
}

/**
 * Delete product image
 * @param {number|string} id
 * @returns {Promise<any>}
 */
export function deleteProductImage(id) {
  return api.delete(`/products/${id}/image`).then(r => r.data);
}

/**
 * Get a single product (kept identical to your current behavior)
 * @param {number|string} id
 * @returns {Promise<object>}
 */
export async function getProduct(id) {
  const resp = await api.get(`/products/${id}`)
  // Return a shape similar to other services you use
  return resp.data?.data ?? resp.data
}

/* -------------------------------------------------------------------------- */
/*                               NEW: list/create/update                      */
/* -------------------------------------------------------------------------- */

/**
 * List products with server-side filtering/sorting/pagination.
 * Supported params (all optional):
 *  page, limit, sort, order, q, model, brand_id, division_id, category_id,
 *  active (0|1), eligible (0|1), price_min, price_max, show_deleted (1)
 * @param {object} params
 * @returns {Promise<{success:boolean,data:any[],meta?:object}>}
 */
export async function listProducts(params = {}) {
  const resp = await api.get('/products', { params });
  // Keep full payload so callers can access resp.meta for pagination
  return resp.data;
}

/**
 * Helper: serialize payload to FormData if it contains a File, otherwise JSON.
 * Field names match backend expectations; image field MUST be "image".
 */
function toMaybeMultipart(payload = {}) {
  const hasFile = payload.image instanceof File || payload.image instanceof Blob;
  if (!hasFile) {
    // Send JSON; allow empty strings/nulls for optional fields (model, etc.)
    const {
      // core fields
      sku, name, category_id,
      // NEW
      model,
      // optional detail fields
      unit, material, finish, image_url,
      // pricing/flags
      price, sale_price, reward_points, is_reward_eligible, active,
    } = payload;

    return {
      data: {
        sku, name, category_id,
        model: model ?? '',          // backend validator allows '' or null
        unit: unit ?? '',
        material: material ?? '',
        finish: finish ?? '',
        image_url: image_url ?? null,
        price,
        sale_price: sale_price ?? null,
        reward_points,
        is_reward_eligible,
        active,
      },
      config: undefined, // no special headers
    };
  }

  // multipart/form-data (browser sets boundary automatically)
  const form = new FormData();
  // required/core
  if (payload.sku != null) form.append('sku', String(payload.sku));
  if (payload.name != null) form.append('name', String(payload.name));
  if (payload.category_id != null) form.append('category_id', String(payload.category_id));

  // NEW: model (optional)
  if (payload.model != null) form.append('model', String(payload.model));

  // optional details
  if (payload.unit != null) form.append('unit', String(payload.unit));
  if (payload.material != null) form.append('material', String(payload.material));
  if (payload.finish != null) form.append('finish', String(payload.finish));
  if (payload.image_url != null) form.append('image_url', String(payload.image_url));

  // pricing/flags
  if (payload.price != null) form.append('price', String(payload.price));
  if (payload.sale_price != null) form.append('sale_price', String(payload.sale_price));
  if (payload.reward_points != null) form.append('reward_points', String(payload.reward_points));
  if (payload.is_reward_eligible != null) form.append('is_reward_eligible', String(payload.is_reward_eligible ? 1 : 0));
  if (payload.active != null) form.append('active', String(payload.active ? 1 : 0));

  // image file last
  form.append('image', payload.image);

  return { data: form, config: undefined }; // don't set Content-Type; axios will
}

/**
 * Create product.
 * Accepts either JSON payload or multipart (if payload.image is provided).
 * Includes optional "model" field; image field name MUST be "image".
 * @param {object} payload
 * @returns {Promise<{success:boolean,data:object}>}
 */
export async function createProduct(payload) {
  const { data, config } = toMaybeMultipart(payload);
  const resp = await api.post('/products', data, config);
  return resp.data;
}

/**
 * Update product (full PUT).
 * Accepts either JSON payload or multipart (if payload.image is provided).
 * Includes optional "model" field; image field name MUST be "image".
 * @param {number|string} id
 * @param {object} payload
 * @returns {Promise<{success:boolean,data:object}>}
 */
export async function updateProduct(id, payload) {
  const { data, config } = toMaybeMultipart(payload);
  const resp = await api.put(`/products/${id}`, data, config);
  return resp.data;
}

/**
 * Partial update (PATCH) — when you only want to send changed fields.
 * Note: If you need to update the image via PATCH, include payload.image (File).
 * @param {number|string} id
 * @param {object} fields
 * @returns {Promise<{success:boolean,data:object}>}
 */
export async function patchProduct(id, fields) {
  const hasFile = fields?.image instanceof File || fields?.image instanceof Blob;
  if (hasFile) {
    // force multipart for image patch
    const { data, config } = toMaybeMultipart(fields);
    const resp = await api.patch(`/products/${id}`, data, config);
    return resp.data;
  }
  // JSON patch
  const resp = await api.patch(`/products/${id}`, fields);
  return resp.data;
}

/**
 * Soft delete product
 * @param {number|string} id
 * @returns {Promise<{success:boolean,data:{id:number,deleted_at:string}}>}
 */
export async function deleteProduct(id) {
  const resp = await api.delete(`/products/${id}`);
  return resp.data;
}

/**
 * Restore soft-deleted product
 * @param {number|string} id
 * @returns {Promise<{success:boolean,data:object}>}
 */
export async function restoreProduct(id) {
  const resp = await api.post(`/products/${id}/restore`);
  return resp.data;
}
