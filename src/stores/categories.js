// src/stores/categories.js
import { defineStore } from 'pinia';
import {
  listCategories,
  listCategoriesByDivision,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  restoreCategory,
} from '@/services/categories';
import { listDivisions } from '@/services/divisions';

// helper: strip empty-string & null/undefined from params
function sanitizeParams(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (v === '' || v === null || v === undefined) continue;
    out[k] = v;
  }
  return out;
}

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    items: [],
    meta: { page: 1, limit: 20, total: 0 },
    loading: false,
    error: null,

    divisions: [],
    filters: {
      division_id: '',
      parent_id: '',
      q: '',
      active: '',
      includeDeleted: false,
      page: 1,
      limit: 20,
    },

    current: null,
  }),

  actions: {
    // in src/stores/categories.js
    async fetchDivisions() {
  try {
    const res = await listDivisions({ limit: 1000, active: true });

    // Accept common shapes and normalize to a plain array
    const rows =
      Array.isArray(res)                  ? res :
      Array.isArray(res?.data)            ? res.data :
      Array.isArray(res?.rows)            ? res.rows :
      Array.isArray(res?.divisions)       ? res.divisions :
      Array.isArray(res?.items)           ? res.items :           // ✅ add this
      Array.isArray(res?.data?.items)     ? res.data.items :      // ✅ and this
      [];

    this.divisions = rows.map(d => ({
      id: Number(d.id ?? d.division_id),
      name: String(d.name ?? d.division_name ?? d.title ?? `#${d.id}`),
      ...d,
    }));
  } catch (e) {
    console.warn('[categories] fetchDivisions failed', e?.response?.data || e);
    this.divisions = [];
  }
},

    async fetchList(extra = {}) {
      this.loading = true; this.error = null;
      try {
        // merge filters, then sanitize to avoid empty-string filters
        const merged = { ...this.filters, ...extra };
        const params = sanitizeParams(merged);

        // only treat as "by division" if division_id is a positive integer
        const divId = Number(params.division_id);
        const byDivision = Number.isInteger(divId) && divId > 0;

        const res = byDivision
          ? await listCategoriesByDivision(divId, params)
          : await listCategories(params);

        this.items = res.data || [];
        this.meta  = res.meta || {
          page: merged.page || 1,
          limit: merged.limit || 20,
          total: this.items.length,
        };

        // persist filters and sync page/limit from meta
        this.filters = {
          ...this.filters,
          ...extra,
          page: this.meta.page,
          limit: this.meta.limit,
        };
      } catch (e) {
        this.error = e?.response?.data?.error || e.message || 'Failed to load categories';
      } finally {
        this.loading = false;
      }
    },

    async loadOne(id) {
      const res = await getCategory(id);
      this.current = res.data;
      return this.current;
    },

    async create(payload) {
      const res = await createCategory(payload);
      await this.fetchList();
      return res.data;
    },

    async update(id, payload) {
      const res = await updateCategory(id, payload);
      await this.fetchList();
      return res.data;
    },

    async remove(id) {
      await deleteCategory(id);
      await this.fetchList();
    },

    async restore(id) {
      await restoreCategory(id);
      await this.fetchList({ includeDeleted: true });
    },
  },
});
