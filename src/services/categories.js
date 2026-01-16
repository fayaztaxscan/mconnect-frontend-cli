// src/services/categories.js
import api from '@/services/api' // axios instance at src/services/api.js

// -------------------- Categories (existing) --------------------
export const listCategories = (params = {}) =>
  api.get('/categories', { params }).then(r => r.data)

// ✅ match backend route: /api/categories/division/:divisionId
export const listCategoriesByDivision = (divisionId, params = {}) =>
  api.get(`/categories/division/${divisionId}`, { params }).then(r => r.data)

export const getCategory = (id, params = {}) =>
  api.get(`/categories/${id}`, { params }).then(r => r.data)
// usage: getCategory(id, { includeAttrDefs: 1 }) if you want combined response

export const createCategory = (payload) =>
  api.post('/categories', payload).then(r => r.data)

export const updateCategory = (id, payload) =>
  api.put(`/categories/${id}`, payload).then(r => r.data)

export const deleteCategory = (id) =>
  api.delete(`/categories/${id}`).then(r => r.data)

export const restoreCategory = (id) =>
  api.post(`/categories/${id}/restore`).then(r => r.data)

// -------------------- Option A: Category Attribute Defs --------------------

// GET /api/categories/:id/attribute-defs
export const getCategoryAttributeDefs = (categoryId) =>
  api.get(`/categories/${categoryId}/attribute-defs`).then(r => r.data)

// PUT /api/categories/:id/attribute-defs/bulk
// defs = [{ attr_key,label,data_type,required,unit,options,sort_order,active }, ...]
export const replaceCategoryAttributeDefsBulk = (categoryId, defs = []) =>
  api.put(`/categories/${categoryId}/attribute-defs/bulk`, defs).then(r => r.data)

// Optional granular endpoints (if you use them later)

// POST /api/categories/:id/attribute-defs
export const createCategoryAttributeDef = (categoryId, payload) =>
  api.post(`/categories/${categoryId}/attribute-defs`, payload).then(r => r.data)

// PUT /api/categories/:id/attribute-defs/:defId
export const updateCategoryAttributeDef = (categoryId, defId, payload) =>
  api.put(`/categories/${categoryId}/attribute-defs/${defId}`, payload).then(r => r.data)

// DELETE /api/categories/:id/attribute-defs/:defId
export const deleteCategoryAttributeDef = (categoryId, defId) =>
  api.delete(`/categories/${categoryId}/attribute-defs/${defId}`).then(r => r.data)

// -------------------- Aliases (store compatibility) --------------------
export const fetchCategories = listCategories
export const fetchCategory = getCategory
