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

              <!-- Existing SKU -->
              <div class="text-sm text-slate-500">
                SKU: <span class="font-mono">{{ product.sku }}</span>
              </div>

              <!-- Model display -->
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
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                :class="product.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-amber-50 text-amber-700 border border-amber-200'"
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
          <div class="text-xs uppercase tracking-wide text-slate-500 mb-1">Rate</div>
          <div class="text-sm">₹ {{ fmtMoney(product.price) }}</div>
        </div>
        <div>
          <div class="text-xs uppercase tracking-wide text-slate-500 mb-1">Sale Price</div>
          <div class="text-sm">
            <span v-if="product.sale_price !== null">₹ {{ fmtMoney(product.sale_price) }}</span>
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

      <!-- Attributes -->
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

export default {
  name: 'ProductDetails',
  props: ['id'],
  data() {
    return {
      product: null,
      loading: false,
      error: '',
      imgBroken: false
    }
  },
  methods: {
    async fetchOne() {
      this.loading = true
      this.error = ''
      try {
        const res = await getProduct(this.id || this.$route.params.id)
        this.product = res?.data || res
      } catch (e) {
        this.error = e?.response?.data?.message || e?.message || 'Failed to load product'
      } finally {
        this.loading = false
      }
    },
    fmtDate(val) {
      if (!val) return '—'
      const d = new Date(val)
      return Number.isNaN(d.getTime()) ? String(val) : d.toLocaleString()
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
