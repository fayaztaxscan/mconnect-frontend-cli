<template>
  <div class="p-4 max-w-4xl mx-auto">
    <h1 class="sr-only">Product Details</h1>

    <!-- Loading / Error -->
    <div v-if="loading" class="text-center text-gray-500 py-10">Loading...</div>
    <div v-else-if="error" class="text-red-500 py-10 text-center">{{ error }}</div>

    <!-- Content -->
    <div v-else-if="product" class="bg-white border rounded p-4 sm:p-6 space-y-6">
      <!-- Header: Image + Title/SKU + State -->
      <div class="flex items-start gap-4">
        <div class="h-20 w-20 rounded border bg-white flex items-center justify-center overflow-hidden">
          <img
            v-if="product.image_url && !imgBroken"
            :src="product.image_url"
            alt="Product Image"
            class="h-20 w-20 object-contain"
            @error="imgBroken = true"
          />
          <img
            v-else
            src="/placeholder-product.png"
            alt="No Product Image"
            class="h-20 w-20 object-contain opacity-70"
          />
        </div>

        <div class="flex-1">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <div class="text-xl font-semibold">{{ product.name }}</div>

              <div class="text-sm text-slate-500">
                SKU: <span class="font-mono">{{ product.sku }}</span>
              </div>

              <div class="text-sm text-slate-500">
                Model: <span class="font-mono">{{ product.model || '—' }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span
                v-if="product.deleted_at"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"
              >
                deleted
              </span>
              <span
                v-else
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
                :class="product.active
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'"
              >
                {{ product.active ? 'active' : 'inactive' }}
              </span>
            </div>
          </div>

          <!-- Chips: Brand / Division / Category -->
          <div class="mt-2 flex flex-wrap gap-2">
            <span class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border">
              <span class="text-slate-500">Brand:</span>
              <span class="font-medium">{{ product.brand_name || '—' }}</span>
            </span>
            <span class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border">
              <span class="text-slate-500">Division:</span>
              <span class="font-medium">{{ product.division_name || '—' }}</span>
            </span>
            <span class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border">
              <span class="text-slate-500">Category:</span>
              <span class="font-medium">{{ product.category_name || '—' }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Prices / Points / Eligibility -->
      <div class="grid sm:grid-cols-3 gap-4">
        <div>
          <div class="text-xs uppercase tracking-wide text-slate-500 mb-1">Price</div>
          <div class="text-sm">₹ {{ fmtMoney(product.price) }}</div>
        </div>

        <div>
          <div class="text-xs uppercase tracking-wide text-slate-500 mb-1">Sale Price</div>
          <div class="text-sm">
            <template v-if="product.sale_price !== null && product.sale_price !== ''">
              <span class="font-semibold">₹ {{ fmtMoney(product.sale_price) }}</span>
              <span class="ml-2 text-slate-500 line-through">₹ {{ fmtMoney(product.price) }}</span>
            </template>
            <span v-else>—</span>
          </div>
        </div>

        <div>
          <div class="text-xs uppercase tracking-wide text-slate-500 mb-1">Reward</div>
          <div class="text-sm flex items-center gap-2">
            <span>{{ product.reward_points }} pts</span>
            <span
              class="px-2 py-0.5 rounded text-xs"
              :class="product.is_reward_eligible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
            >
              {{ product.is_reward_eligible ? 'Eligible' : 'Not eligible' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Core Attributes -->
      <div class="grid sm:grid-cols-3 gap-4">
        <div>
          <div class="text-xs uppercase tracking-wide text-slate-500 mb-1">Unit</div>
          <div class="text-sm">{{ product.unit || '—' }}</div>
        </div>
        <div>
          <div class="text-xs uppercase tracking-wide text-slate-500 mb-1">Material</div>
          <div class="text-sm">{{ product.material || '—' }}</div>
        </div>
        <div>
          <div class="text-xs uppercase tracking-wide text-slate-500 mb-1">Finish</div>
          <div class="text-sm">{{ product.finish || '—' }}</div>
        </div>
      </div>

      <!-- ✅ Additional Details (Custom Fields) -->
      <div v-if="showCustomCard" class="border rounded-md p-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="text-sm font-semibold">Additional Details</div>
            <div class="text-xs text-slate-500">
              Category-specific fields (custom)
            </div>
          </div>

          <div class="flex items-center gap-3">
            <label class="inline-flex items-center gap-2 text-xs text-slate-600 select-none">
              <input type="checkbox" v-model="showEmptyCustomFields" />
              Show empty fields
            </label>
          </div>
        </div>

        <div v-if="customLoading" class="text-sm text-slate-500 mt-3">Loading additional details…</div>
        <div v-else-if="customError" class="text-sm text-red-600 mt-3">{{ customError }}</div>

        <div v-else class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="f in visibleCustomFields"
            :key="f.key"
            class="border rounded p-3"
          >
            <div class="text-xs text-slate-500">{{ f.label }}</div>

            <!-- Value -->
            <div class="mt-1 text-sm">
              <!-- bool -->
              <template v-if="f.data_type === 'bool'">
                <span
                  class="inline-flex px-2 py-0.5 rounded text-xs"
                  :class="f.value === true ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                >
                  {{ f.value === true ? 'Yes' : 'No' }}
                </span>
              </template>

              <!-- multiselect -->
              <template v-else-if="f.data_type === 'multiselect'">
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="(v, idx) in (Array.isArray(f.value) ? f.value : [])"
                    :key="idx"
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs border bg-slate-50"
                  >
                    {{ v }}
                  </span>
                  <span v-if="!f.value || !f.value.length" class="text-slate-400">—</span>
                </div>
              </template>

              <!-- select -->
              <template v-else-if="f.data_type === 'select'">
                <span v-if="f.value" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs border bg-slate-50">
                  {{ f.value }}
                </span>
                <span v-else class="text-slate-400">—</span>
              </template>

              <!-- number with unit -->
              <template v-else-if="f.data_type === 'number'">
                <span v-if="f.value !== null && f.value !== undefined && f.value !== ''">
                  {{ f.value }} <span v-if="f.unit" class="text-slate-500">{{ f.unit }}</span>
                </span>
                <span v-else class="text-slate-400">—</span>
              </template>

              <!-- date/text fallback -->
              <template v-else>
                <span v-if="f.value !== null && f.value !== undefined && String(f.value).trim() !== ''">
                  {{ f.data_type === 'date' ? fmtDateOnly(f.value) : f.value }}
                </span>
                <span v-else class="text-slate-400">—</span>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Meta -->
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <div class="text-xs uppercase tracking-wide text-slate-500 mb-1">Created</div>
          <div class="text-sm">{{ fmtDate(product.created_at) }}</div>
        </div>
        <div>
          <div class="text-xs uppercase tracking-wide text-slate-500 mb-1">Updated</div>
          <div class="text-sm">{{ fmtDate(product.updated_at) }}</div>
        </div>
      </div>

      <!-- Actions -->
      <div class="pt-2 flex gap-2">
        <router-link
          :to="{ name: 'EditProduct', params: { id: product.id } }"
          class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          v-if="!product.deleted_at"
        >
          Edit
        </router-link>
        <router-link :to="{ name: 'ProductList' }" class="px-4 py-2 border rounded">
          Back
        </router-link>
      </div>
    </div>

    <!-- Fallback -->
    <div v-else class="text-center text-slate-500 py-10">Product not found.</div>
  </div>
</template>

<script>
import { getProduct } from '@/services/products'
import api from '@/services/api' // ✅ axios instance (baseURL '/api', JWT header)

export default {
  name: 'ProductDetails',
  props: ['id'],
  data() {
    return {
      product: null,
      loading: false,
      error: '',
      imgBroken: false,

      // custom fields
      customLoading: false,
      customError: '',
      customFields: [],
      showEmptyCustomFields: false
    }
  },
  computed: {
    showCustomCard() {
      // Show card if there are defs/fields OR backend provided custom_attributes
      if (this.customLoading) return true
      if (this.customFields && this.customFields.length) return true
      return false
    },
    visibleCustomFields() {
      const list = Array.isArray(this.customFields) ? this.customFields : []
      if (this.showEmptyCustomFields) return list
      return list.filter(f => f.has_value)
    }
  },
  methods: {
    async fetchOne() {
      this.loading = true
      this.error = ''
      this.customFields = []
      this.customError = ''
      this.customLoading = false

      try {
        const res = await getProduct(this.id || this.$route.params.id)
        this.product = res?.data || res

        // ✅ Load custom fields after product loads
        await this.loadCustomFields()
      } catch (e) {
        this.error = e?.response?.data?.message || e?.message || 'Failed to load product'
      } finally {
        this.loading = false
      }
    },

    // ---------- Custom fields loader (works with or without backend support) ----------
    async loadCustomFields() {
      if (!this.product) return

      // 1) If backend already returns merged fields, use it (future clean mode)
      // Expected format: product.custom_attributes = [{ key,label,data_type,unit,value }]
      if (Array.isArray(this.product.custom_attributes) && this.product.custom_attributes.length) {
        this.customFields = this.product.custom_attributes.map(x => ({
          key: x.key || x.attr_key,
          label: x.label || x.key,
          data_type: x.data_type || 'text',
          unit: x.unit || null,
          value: x.value,
          has_value: this.hasValueByType(x.value, x.data_type)
        }))
        return
      }

      // 2) Current mode: fetch defs and merge with attributes_json
      const categoryId = this.product.category_id
      if (!categoryId) return

      this.customLoading = true
      this.customError = ''

      try {
        const defsResp = await api.get(`/categories/${categoryId}/attribute-defs`)
        const defs = defsResp?.data?.data || defsResp?.data || []

        const attrs = this.safeParseJson(this.product.attributes_json) || {}

        this.customFields = (Array.isArray(defs) ? defs : []).map(d => {
          const key = d.attr_key
          const dt = d.data_type || 'text'
          const val = Object.prototype.hasOwnProperty.call(attrs, key) ? attrs[key] : null

          return {
            key,
            label: d.label || key,
            data_type: dt,
            unit: d.unit || null,
            value: val,
            has_value: this.hasValueByType(val, dt)
          }
        })
      } catch (e) {
        // Don’t block page — just hide this section if defs fail
        this.customError = e?.response?.data?.message || 'Failed to load additional details'
        this.customFields = []
      } finally {
        this.customLoading = false
      }
    },

    hasValueByType(val, type) {
      if (type === 'bool') return val === true || val === false
      if (type === 'number') return val !== null && val !== undefined && val !== ''
      if (type === 'multiselect') return Array.isArray(val) && val.length > 0
      return val !== null && val !== undefined && String(val).trim() !== ''
    },

    safeParseJson(v) {
      if (v == null) return null
      if (typeof v === 'object') return v
      if (typeof v === 'string') {
        const s = v.trim()
        if (!s) return null
        try { return JSON.parse(s) } catch { return null }
      }
      return null
    },

    fmtDate(val) {
      if (!val) return '—'
      const d = new Date(val)
      return Number.isNaN(d.getTime()) ? String(val) : d.toLocaleString()
    },
    fmtDateOnly(val) {
      if (!val) return '—'
      const d = new Date(val)
      if (Number.isNaN(d.getTime())) return String(val)
      return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' })
    },
    fmtMoney(v) {
      return Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
  },
  created() {
    this.fetchOne()
  },
  watch: {
    '$route.params.id'(n, o) {
      if (n && n !== o) {
        this.imgBroken = false
        this.fetchOne()
      }
    }
  }
}
</script>

<style scoped>
/* Tailwind handles styling */
</style>
