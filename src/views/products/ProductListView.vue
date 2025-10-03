<!-- src/views/products/ProductListView.vue -->
<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <h1 class="text-2xl font-semibold">Product Catalogue</h1>
      <router-link
        :to="{ name: 'CreateProduct' }"
        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        + New Product
      </router-link>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 mb-4">
      <input
        v-model="filters.q"
        @input="debouncedFetch"
        type="text"
        placeholder="Search name / SKU"
        class="border rounded px-3 py-2 w-full"
      />

      <!-- NEW: Model filter -->
      <input
        v-model="filters.model"
        @input="debouncedFetch"
        type="text"
        placeholder="Search model"
        class="border rounded px-3 py-2 w-full"
      />

      <select v-model="filters.brand_id" @change="onFilterChange" class="border rounded px-3 py-2 w-full">
        <option :value="''">All Brands</option>
        <option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</option>
      </select>

      <select v-model="filters.division_id" @change="onFilterChange" class="border rounded px-3 py-2 w-full">
        <option :value="''">All Divisions</option>
        <option v-for="d in divisions" :key="d.id" :value="d.id">{{ d.name }}</option>
      </select>

      <select v-model="filters.category_id" @change="onFilterChange" class="border rounded px-3 py-2 w-full">
        <option :value="''">All Categories</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>

      <select v-model="filters.active" @change="onFilterChange" class="border rounded px-3 py-2 w-full">
        <option value="">Active + Inactive</option>
        <option value="1">Active only</option>
        <option value="0">Inactive only</option>
      </select>

      <select v-model="filters.eligible" @change="onFilterChange" class="border rounded px-3 py-2 w-full">
        <option value="">All Eligibility</option>
        <option value="1">Reward eligible</option>
        <option value="0">Not eligible</option>
      </select>
    </div>

    <div class="flex items-center gap-4 mb-4">
      <label class="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          v-model="filters.show_deleted"
          true-value="1"
          false-value=""
          @change="onFilterChange"
        />
        Show deleted
      </label>

      <button @click="resetFilters" class="px-3 py-2 border rounded">Reset</button>

      <div class="ml-auto flex items-center gap-2">
        <span class="text-sm text-gray-600">Rows:</span>
        <select v-model.number="meta.limit" @change="onPerPage" class="border rounded px-2 py-1 text-sm">
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto border rounded bg-white">
      <table class="min-w-full text-sm border-collapse">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2 border">#</th>
            <th class="px-4 py-2 border">Image</th>

            <th
              class="px-4 py-2 border cursor-pointer select-none"
              @click="toggleSort('p.sku')"
              :aria-sort="ariaSort('p.sku')"
              title="Sort by SKU"
            >
              SKU <span v-if="isSorted('p.sku')" class="opacity-60 text-xs">({{ order }})</span>
            </th>

            <th
              class="px-4 py-2 border cursor-pointer select-none"
              @click="toggleSort('p.name')"
              :aria-sort="ariaSort('p.name')"
              title="Sort by Name"
            >
              Name <span v-if="isSorted('p.name')" class="opacity-60 text-xs">({{ order }})</span>
            </th>

            <!-- NEW: Model column -->
            <th
              class="px-4 py-2 border cursor-pointer select-none"
              @click="toggleSort('p.model')"
              :aria-sort="ariaSort('p.model')"
              title="Sort by Model"
            >
              Model <span v-if="isSorted('p.model')" class="opacity-60 text-xs">({{ order }})</span>
            </th>

            <th class="px-4 py-2 border">Brand / Division / Category</th>

            <th
              class="px-4 py-2 border text-right cursor-pointer select-none"
              @click="toggleSort('p.price')"
              :aria-sort="ariaSort('p.price')"
              title="Sort by MRP"
            >
              MRP <span v-if="isSorted('p.price')" class="opacity-60 text-xs">({{ order }})</span>
            </th>

            <th
              class="px-4 py-2 border text-right cursor-pointer select-none"
              @click="toggleSort('p.sale_price')"
              :aria-sort="ariaSort('p.sale_price')"
              title="Sort by Sale Price"
            >
              Sale <span v-if="isSorted('p.sale_price')" class="opacity-60 text-xs">({{ order }})</span>
            </th>

            <th
              class="px-4 py-2 border text-right cursor-pointer select-none"
              @click="toggleSort('p.reward_points')"
              :aria-sort="ariaSort('p.reward_points')"
              title="Sort by Reward Points"
            >
              Points <span v-if="isSorted('p.reward_points')" class="opacity-60 text-xs">({{ order }})</span>
            </th>

            <th class="px-4 py-2 border text-center">Eligible</th>

            <th
              class="px-4 py-2 border cursor-pointer select-none"
              @click="toggleSort('p.active')"
              :aria-sort="ariaSort('p.active')"
              title="Sort by State"
            >
              State <span v-if="isSorted('p.active')" class="opacity-60 text-xs">({{ order }})</span>
            </th>

            <th class="px-4 py-2 border">Actions</th>
          </tr>
        </thead>

        <tbody>
          <!-- Loading -->
          <tr v-if="loading">
            <td colspan="12" class="px-4 py-8 text-center text-gray-500">Loading…</td>
          </tr>

          <!-- Error -->
          <tr v-else-if="error">
            <td colspan="12" class="px-4 py-8 text-center text-red-600">{{ error }}</td>
          </tr>

          <!-- Empty -->
          <tr v-else-if="!products.length">
            <td colspan="12" class="text-center py-6 text-gray-500">No products found.</td>
          </tr>

          <!-- Rows -->
          <tr v-else v-for="(p, i) in products" :key="p.id" class="hover:bg-gray-50">
            <td class="px-4 py-2 border">
              {{ (meta.page - 1) * meta.limit + i + 1 }}
            </td>

            <td class="px-4 py-2 border">
              <div class="h-10 w-10 rounded bg-white border overflow-hidden flex items-center justify-center">
                <img
                  v-if="p.image_url"
                  :src="p.image_url"
                  alt=""
                  class="h-10 w-10 object-contain"
                  loading="lazy"
                  @error="onImgError"
                />
                <span v-else class="text-xs text-slate-400">—</span>
              </div>
            </td>

            <td class="px-4 py-2 border font-mono">{{ p.sku }}</td>
            <td class="px-4 py-2 border">{{ p.name }}</td>
            <td class="px-4 py-2 border">{{ p.model || '—' }}</td> <!-- NEW -->

            <td class="px-4 py-2 border">
              <div class="text-xs text-gray-700">
                <div><span class="font-medium">Brand:</span> {{ p.brand_name }}</div>
                <div><span class="font-medium">Division:</span> {{ p.division_name }}</div>
                <div><span class="font-medium">Category:</span> {{ p.category_name }}</div>
              </div>
            </td>

            <td class="px-4 py-2 border text-right">₹ {{ n(p.price) }}</td>

            <td class="px-4 py-2 border text-right">
              <span v-if="p.sale_price !== null">₹ {{ n(p.sale_price) }}</span>
              <span v-else class="text-gray-400">—</span>
            </td>

            <td class="px-4 py-2 border text-right">{{ p.reward_points }}</td>

            <td class="px-4 py-2 border text-center">
              <span
                class="px-2 py-1 rounded text-xs"
                :class="p.is_reward_eligible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
              >
                {{ p.is_reward_eligible ? 'Yes' : 'No' }}
              </span>
            </td>

            <td class="px-4 py-2 border">
              <span
                v-if="p.deleted_at"
                class="px-2 py-1 rounded text-xs bg-red-100 text-red-700"
              >deleted</span>
              <span
                v-else
                class="px-2 py-1 rounded text-xs"
                :class="p.active ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
              >
                {{ p.active ? 'active' : 'inactive' }}
              </span>
            </td>

            <td class="px-4 py-2 border whitespace-nowrap">
              <router-link
                :to="{ name: 'ProductDetails', params: { id: p.id } }"
                class="text-blue-600 hover:underline mr-3"
              >
                View
              </router-link>
              <router-link
                v-if="!p.deleted_at"
                :to="{ name: 'EditProduct', params: { id: p.id } }"
                class="text-indigo-600 hover:underline mr-3"
              >
                Edit
              </router-link>
              <button v-if="!p.deleted_at" @click="softDelete(p)" class="text-red-600 hover:underline">
                Delete
              </button>
              <button v-else @click="restore(p)" class="text-green-700 hover:underline">
                Restore
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between mt-4">
      <div class="text-sm text-gray-600">
        Page {{ meta.page }} / {{ meta.pages }} • Total {{ meta.total }}
      </div>
      <div class="flex gap-2">
        <button
          :disabled="meta.page <= 1 || loading"
          @click="goPrev"
          class="px-3 py-2 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <button
          :disabled="meta.page >= meta.pages || loading"
          @click="goNext"
          class="px-3 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '@/services/api'

const products = ref([])
const loading = ref(false)
const error = ref('')

const brands = ref([])
const divisions = ref([])
const categories = ref([])

const meta = ref({ page: 1, pages: 1, limit: 10, total: 0 })
const sort = ref('p.id')
const order = ref('DESC')

// filters the API understands (same keys as controller)
const filters = ref({
  q: '',
  model: '',            // NEW
  brand_id: '',
  division_id: '',
  category_id: '',
  active: '',
  eligible: '',
  show_deleted: ''
})

let _debounceId = null

// ---------- helpers ----------
function n(v) {
  return Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function onImgError(e) {
  e.target.src = '/placeholder-product.png'
  e.target.onerror = null
}
function pluckArray(resp, keys = ['data', 'items', 'rows', 'list']) {
  const obj = resp?.data ?? resp
  if (Array.isArray(obj)) return obj
  for (const k of keys) if (Array.isArray(obj?.[k])) return obj[k]
  if (obj?.data && typeof obj.data === 'object') {
    for (const k of keys) if (Array.isArray(obj.data[k])) return obj.data[k]
  }
  if (Array.isArray(obj?.brands)) return obj.brands
  if (Array.isArray(obj?.divisions)) return obj.divisions
  if (Array.isArray(obj?.categories)) return obj.categories
  return []
}

// ---------- meta fetch ----------
async function fetchBrands() {
  try { brands.value = pluckArray(await api.get('/brands', { params: { limit: 1000 } })) }
  catch { brands.value = [] }
}
async function fetchDivisions(brandId = '') {
  try {
    const params = { limit: 1000 }; if (brandId) params.brand_id = brandId
    divisions.value = pluckArray(await api.get('/divisions', { params }))
  } catch { divisions.value = [] }
}
async function fetchCategories() {
  try {
    categories.value = pluckArray(await api.get('/categories', { params: { limit: 1000 } })).filter(x => !x.deleted_at)
  } catch { categories.value = [] }
}

// ---------- list ----------
function resetFilters() {
  filters.value = { q: '', model: '', brand_id: '', division_id: '', category_id: '', active: '', eligible: '', show_deleted: '' }
  meta.value.page = 1
  fetchProducts()
}
function debouncedFetch() {
  clearTimeout(_debounceId)
  _debounceId = setTimeout(() => {
    meta.value.page = 1
    fetchProducts()
  }, 300)
}
function onFilterChange() {
  meta.value.page = 1
  fetchProducts()
}
function onPerPage() {
  meta.value.page = 1
  fetchProducts()
}

async function fetchProducts(pageArg) {
  loading.value = true
  error.value = ''
  try {
    const page = pageArg ?? meta.value.page
    const params = { ...filters.value, page, limit: meta.value.limit, sort: sort.value, order: order.value }

    // prune empty filters so the API doesn’t over-filter
    if (params.model === '') delete params.model       // NEW
    if (params.brand_id === '') delete params.brand_id
    if (params.division_id === '') delete params.division_id
    if (params.category_id === '') delete params.category_id
    if (params.active === '') delete params.active
    if (params.eligible === '') delete params.eligible
    if (params.show_deleted === '') delete params.show_deleted

    const resp = await api.get('/products', { params })
    const body = resp.data
    products.value = body.data || body || []
    meta.value.page  = body.meta?.page  ?? page
    meta.value.limit = body.meta?.limit ?? meta.value.limit
    meta.value.total = body.meta?.total ?? products.value.length
    meta.value.pages = body.meta?.pages ?? 1
  } catch (e) {
    error.value = 'Failed to load products: ' + (e.response?.data?.message || e.message)
    console.error(e)
  } finally {
    loading.value = false
  }
}

function goPrev() {
  if (meta.value.page > 1 && !loading.value) {
    fetchProducts(meta.value.page - 1)
  }
}
function goNext() {
  if (meta.value.page < meta.value.pages && !loading.value) {
    fetchProducts(meta.value.page + 1)
  }
}

async function softDelete(p) {
  if (!confirm(`Delete product "${p.name}"?`)) return
  try {
    await api.delete(`/products/${p.id}`)
    if (products.value.length === 1 && meta.value.page > 1) {
      meta.value.page -= 1
    }
    fetchProducts()
  } catch (e) {
    alert(e?.response?.data?.message || e.message || 'Delete failed')
  }
}

async function restore(p) {
  try {
    await api.post(`/products/${p.id}/restore`)
  } catch (e) {
    alert(e?.response?.data?.message || e.message || 'Restore failed')
  } finally {
    fetchProducts()
  }
}

function toggleSort(col) {
  if (sort.value === col) {
    order.value = order.value === 'ASC' ? 'DESC' : 'ASC'
  } else {
    sort.value = col
    order.value = 'ASC'
  }
  meta.value.page = 1
  fetchProducts()
}
function isSorted(col) { return sort.value === col }
function ariaSort(col) { return isSorted(col) ? (order.value === 'ASC' ? 'ascending' : 'descending') : 'none' }

// ---------- lifecycle ----------
onMounted(async () => {
  await Promise.all([ fetchBrands(), fetchDivisions(''), fetchCategories() ])
  await fetchProducts(1)
})
watch(() => filters.value.brand_id, async (brandId) => {
  filters.value.division_id = ''
  await fetchDivisions(brandId || '')
})
</script>

<style scoped>
table { border-collapse: collapse; }
th, td { text-align: left; }
</style>
