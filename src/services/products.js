// src/services/products.js
export function uploadProductImage(id, file) {
  const form = new FormData();
  form.append('image', file);
  return api.post(`/products/${id}/image`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);
}
export function deleteProductImage(id) {
  return api.delete(`/products/${id}/image`).then(r => r.data);
}
