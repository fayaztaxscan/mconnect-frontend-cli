<!-- src/views/products/ProductFormView.vue -->
<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-semibold mb-4">
      {{ isEditing ? 'Edit Product' : 'Create New Product' }}
    </h1>

    <form @submit.prevent="onSubmit" class="space-y-6 bg-white shadow rounded p-6">
      <div v-if="error" class="text-red-600">{{ error }}</div>

      <!-- SKU -->
      <div>
        <label for="sku" class="block text-sm font-medium text-gray-700">
          SKU <span class="text-red-500">*</span>
        </label>
        <input
          id="sku"
          v-model.trim="form.sku"
          type="text"
          required
          class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <!-- Name -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700">
          Name <span class="text-red-500">*</span>
        </label>
        <input
          id="name"
          v-model.trim="form.name"
          type="text"
          required
          class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <!-- Model -->
      <div>
        <label for="model" class="block text-sm font-medium text-gray-700">
          Model <span class="text-gray-400 text-xs">(optional)</span>
        </label>
        <input
          id="model"
          v-model.trim="form.model"
          type="text"
          maxlength="100"
          placeholder="e.g., ZX-100, 15s-eq2144AU"
          class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <!-- Brand & Division -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="brand" class="block text-sm font-medium text-gray-700">Brand</label>
          <select
            id="brand"
            v-model.number="selection.brand_id"
            :disabled="!brands.length"
            class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option :value="null">All Brands</option>
            <option v-for="b in brands" :key="b.id" :value="Number(b.id)">{{ b.name }}</option>
          </select>
        </div>

        <div>
          <label for="division" class="block text-sm font-medium text-gray-700">Division</label>
          <select
            id="division"
            v-model.number="selection.division_id"
            :disabled="!divisions.length"
            class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
          >
            <option :value="null">All Divisions</option>
            <option v-for="d in divisions" :key="d.id" :value="Number(d.id)">{{ d.name }}</option>
          </select>
        </div>
      </div>

      <!-- Category (filtered) -->
      <div>
        <label for="category" class="block text-sm font-medium text-gray-700">
          Category <span class="text-red-500">*</span>
        </label>
        <select
          id="category"
          v-model.number="form.category_id"
          required
          :disabled="!categories.length"
          class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
        >
          <option :value="null" disabled>Select a category</option>
          <option v-for="c in categories" :key="c.id" :value="Number(c.id)">
            {{ c.name }}
            <template v-if="c.division_name || c.brand_name">
              — {{ c.division_name || '' }}<span v-if="c.brand_name"> • {{ c.brand_name }}</span>
            </template>
          </option>
        </select>
        <p class="text-xs text-gray-500 mt-1">Category determines Brand & Division for the product.</p>
      </div>

      <!-- Pricing -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="price" class="block text-sm font-medium text-gray-700">Rate (₹)</label>
          <input
            id="price"
            v-model.number="form.price"
            type="number"
            step="0.01"
            min="0"
            required
            class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label for="sale_price" class="block text-sm font-medium text-gray-700">Sale Price (₹, optional)</label>
          <input
            id="sale_price"
            v-model.number="form.sale_price"
            type="number"
            step="0.01"
            min="0"
            class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Leave blank if none"
          />
        </div>
      </div>

      <!-- Rewards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="reward_points" class="block text-sm font-medium text-gray-700">Reward Points</label>
          <input
            id="reward_points"
            v-model.number="form.reward_points"
            type="number"
            min="0"
            class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div class="flex items-center gap-2 mt-6 sm:mt-8">
          <input id="eligible" type="checkbox" v-model="form.is_reward_eligible" class="h-4 w-4" />
          <label for="eligible" class="text-sm">Reward eligible</label>
        </div>
      </div>

      <!-- Attributes (your existing fixed optional fields) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label for="unit" class="block text-sm font-medium text-gray-700">Unit</label>
          <input id="unit" v-model.trim="form.unit" class="mt-1 block w-full border rounded px-3 py-2" placeholder="e.g., pcs, box" />
        </div>
        <div>
          <label for="material" class="block text-sm font-medium text-gray-700">Material</label>
          <input id="material" v-model.trim="form.material" class="mt-1 block w-full border rounded px-3 py-2" placeholder="e.g., Stainless Steel" />
        </div>
        <div>
          <label for="finish" class="block text-sm font-medium text-gray-700">Finish</label>
          <input id="finish" v-model.trim="form.finish" class="mt-1 block w-full border rounded px-3 py-2" placeholder="e.g., SS Chrome/SS Matt" />
        </div>
      </div>

      <!-- ✅ Dynamic Custom Fields (Option A) -->
      <div class="border rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold">Additional Details</h3>
            <p class="text-xs text-slate-500">These fields depend on the selected category.</p>
          </div>
          <div v-if="attrLoading" class="text-xs text-slate-500">Loading fields…</div>
        </div>

        <div v-if="attrError" class="text-sm text-red-600 mt-2">{{ attrError }}</div>

        <div v-if="!attrLoading && attrDefs.length === 0" class="text-sm text-slate-500 mt-3">
          No additional fields for this category.
        </div>

        <div v-else class="mt-4 space-y-4">
          <div v-for="def in attrDefs" :key="def.id" class="grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-2 items-start">
            <div>
              <label class="block text-sm font-medium text-gray-700">
                {{ def.label }}
                <span v-if="def.required" class="text-red-500">*</span>
                <span v-if="def.unit" class="text-gray-400 text-xs">({{ def.unit }})</span>
              </label>
              <p v-if="def.data_type === 'multiselect'" class="text-xs text-slate-500">You can select multiple.</p>
            </div>

            <!-- text -->
            <input
              v-if="def.data_type === 'text'"
              v-model.trim="attrValues[def.attr_key]"
              type="text"
              class="w-full border rounded px-3 py-2"
              :placeholder="def.label"
            />

            <!-- number -->
            <input
              v-else-if="def.data_type === 'number'"
              v-model.number="attrValues[def.attr_key]"
              type="number"
              step="0.01"
              class="w-full border rounded px-3 py-2"
              :placeholder="def.unit ? def.unit : def.label"
            />

            <!-- bool -->
            <div v-else-if="def.data_type === 'bool'" class="flex items-center gap-2 pt-2">
              <input
                :id="`attr_${def.attr_key}`"
                type="checkbox"
                v-model="attrValues[def.attr_key]"
                class="h-4 w-4"
              />
              <label :for="`attr_${def.attr_key}`" class="text-sm text-slate-700">Yes</label>
            </div>

            <!-- date -->
            <input
              v-else-if="def.data_type === 'date'"
              v-model="attrValues[def.attr_key]"
              type="date"
              class="w-full border rounded px-3 py-2"
            />

            <!-- select -->
            <select
              v-else-if="def.data_type === 'select'"
              v-model="attrValues[def.attr_key]"
              class="w-full border rounded px-3 py-2"
            >
              <option value="">Select</option>
              <option v-for="opt in (def.options || [])" :key="opt" :value="opt">{{ opt }}</option>
            </select>

            <!-- multiselect -->
            <select
              v-else-if="def.data_type === 'multiselect'"
              multiple
              v-model="attrValues[def.attr_key]"
              class="w-full border rounded px-3 py-2 h-28"
            >
              <option v-for="opt in (def.options || [])" :key="opt" :value="opt">{{ opt }}</option>
            </select>

            <!-- fallback -->
            <input
              v-else
              v-model.trim="attrValues[def.attr_key]"
              type="text"
              class="w-full border rounded px-3 py-2"
            />

            <p v-if="attrFieldErrors[def.attr_key]" class="text-xs text-red-600 sm:col-start-2">
              {{ attrFieldErrors[def.attr_key] }}
            </p>
          </div>
        </div>
      </div>

      <!-- Image -->
      <div class="grid sm:grid-cols-[1fr_auto] gap-4 items-start">
        <div>
          <label class="block text-sm font-medium text-gray-700">Product Image</label>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="onFileChange"
            class="block w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <p class="text-xs text-slate-500 mt-1">PNG/JPG/WebP up to 2 MB.</p>
          <div v-if="uploadError" class="text-xs text-red-600 mt-1">{{ uploadError }}</div>
        </div>

        <div class="justify-self-end">
          <div v-if="previewUrl || form.image_url" class="flex flex-col items-center">
            <img :src="previewFull" alt="Preview" class="h-20 w-20 rounded object-cover border bg-white" />
            <button
              v-if="previewUrl"
              type="button"
              @click="clearSelectedFile"
              class="mt-2 text-xs text-slate-600 hover:text-slate-900 underline"
            >
              Remove selected
            </button>
          </div>
        </div>
      </div>

      <!-- Status -->
      <div>
        <label for="active" class="block text-sm font-medium text-gray-700">Status</label>
        <select id="active" v-model.number="form.active" class="mt-1 block w-full border rounded px-3 py-2">
          <option :value="1">active</option>
          <option :value="0">inactive</option>
        </select>
      </div>

      <!-- Regional Pricing & Availability -->
      <div class="border rounded-lg overflow-hidden">
        <button
          type="button"
          @click="pricingOpen = !pricingOpen"
          class="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700"
        >
          <span>Regional Pricing &amp; Availability</span>
          <svg
            :class="pricingOpen ? 'rotate-180' : ''"
            class="w-4 h-4 transition-transform"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div v-if="pricingOpen" class="p-4">
          <div v-if="pricingLoading" class="text-sm text-gray-500">Loading regions…</div>
          <div v-else-if="!regionalPricing.length" class="text-sm text-gray-400">No regions found.</div>
          <div v-else class="space-y-4">
            <div
              v-for="row in regionalPricing"
              :key="row.region_id"
              class="grid grid-cols-2 md:grid-cols-5 gap-3 p-3 bg-gray-50 rounded-lg border"
            >
              <!-- Region label -->
              <div class="col-span-2 md:col-span-1 flex flex-col justify-center">
                <span class="font-medium text-sm text-gray-800">{{ row.region_name }}</span>
                <span class="text-xs text-gray-400">{{ row.currency_code }}</span>
              </div>

              <!-- Price -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">Price</label>
                <div class="relative">
                  <span class="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">{{ row.currency_symbol || row.currency_code }}</span>
                  <input
                    v-model.number="row.price"
                    type="number" min="0" step="0.01"
                    class="w-full border rounded px-2 py-1.5 pl-10 text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <!-- Sale Price -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">Sale Price</label>
                <div class="relative">
                  <span class="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">{{ row.currency_symbol || row.currency_code }}</span>
                  <input
                    v-model.number="row.sale_price"
                    type="number" min="0" step="0.01"
                    class="w-full border rounded px-2 py-1.5 pl-10 text-sm"
                    placeholder="optional"
                  />
                </div>
              </div>

              <!-- Reward Points -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">Reward Pts</label>
                <input
                  v-model.number="row.reward_points"
                  type="number" min="0" step="1"
                  class="w-full border rounded px-2 py-1.5 text-sm"
                  placeholder="0"
                />
              </div>

              <!-- Active toggle -->
              <div class="flex items-end pb-1">
                <label class="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input type="checkbox" v-model="row.is_active" :true-value="1" :false-value="0" class="rounded" />
                  <span :class="row.is_active ? 'text-green-600' : 'text-gray-400'">
                    {{ row.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div v-if="pricingSaveError" class="mt-2 text-xs text-amber-600">{{ pricingSaveError }}</div>
        </div>
      </div>

      <div class="flex justify-end gap-2">
        <router-link :to="{ name: 'ProductList' }" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
          Cancel
        </router-link>
        <button
          type="submit"
          :disabled="saving || uploading"
          class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {{
            uploading && fileBlob
              ? 'Uploading image…'
              : saving
                ? (isEditing ? 'Updating…' : 'Creating…')
                : (isEditing ? 'Update' : 'Create')
          }}
        </button>
      </div>

      <!-- Upload progress bar -->
      <div v-if="uploading && fileBlob" class="mt-3">
        <div class="flex justify-between text-xs text-slate-600 mb-1">
          <span>Uploading image</span>
          <span>{{ uploadProgress }}%</span>
        </div>
        <div class="w-full bg-slate-200 rounded-full h-1.5">
          <div
            class="bg-indigo-500 h-1.5 rounded-full transition-all duration-200"
            :style="{ width: uploadProgress + '%' }"
          ></div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api'
import { resolveImageUrl } from '@/utils/imageUrl'
import { useToast } from '@/composables/useToast'
import { getCategoryAttributeDefs } from '@/services/categories'
import { useRegions } from '@/composables/useRegions'

const router = useRouter()
const route = useRoute()
const { success, error: toastError } = useToast()
const { regions, fetchRegions, formatPrice } = useRegions()

const isEditing = ref(false)
const saving = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')
const hydrating = ref(false)

const uploadError = ref('')
const fileInput = ref(null)
const fileBlob = ref(null)
const previewUrl = ref('')

// ✅ dynamic attribute defs + values
const attrDefs = ref([])
const attrValues = reactive({}) // key -> value
const attrLoading = ref(false)
const attrError = ref('')
const attrFieldErrors = reactive({}) // key -> message

// Regional pricing state
const pricingOpen = ref(false)
const pricingLoading = ref(false)
const pricingSaveError = ref('')
const regionalPricing = ref([]) // [{ region_id, region_name, currency_code, currency_symbol, price, sale_price, reward_points, is_active }]

const form = reactive({
  sku: '',
  name: '',
  model: '',
  category_id: null,
  unit: '',
  price: 0,
  sale_price: null,
  reward_points: 0,
  is_reward_eligible: true,
  material: '',
  finish: '',
  image_url: '',
  active: 1
})

const selection = reactive({ brand_id: null, division_id: null })
const brands = ref([])
const divisions = ref([])
const categories = ref([])
const allCategories = ref([])

const previewFull = computed(() =>
  previewUrl.value ? previewUrl.value : (form.image_url ? resolveImageUrl(form.image_url) : '')
)

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

async function fetchBrands() {
  try { brands.value = pluckArray(await api.get('/brands', { params: { limit: 1000 } })) }
  catch { brands.value = [] }
}

async function fetchDivisions(brandId = '') {
  try {
    const params = { limit: 1000 }
    if (brandId) params.brand_id = brandId
    divisions.value = pluckArray(await api.get('/divisions', { params }))
  } catch { divisions.value = [] }
}

async function fetchCategories(divisionId = '') {
  try {
    if (divisionId) {
      try {
        categories.value = pluckArray(
          await api.get('/categories', { params: { division_id: divisionId, limit: 1000 } })
        ).filter(x => !x.deleted_at)
        return
      } catch {}
      categories.value = pluckArray(await api.get(`/categories/division/${divisionId}`)).filter(x => !x.deleted_at)
      return
    }
    const all = pluckArray(await api.get('/categories', { params: { limit: 1000 } })).filter(x => !x.deleted_at)
    allCategories.value = all
    categories.value = all
  } catch { categories.value = [] }
}

// ---------- Option A: attribute defs ----------
function clearAttrState() {
  attrDefs.value = []
  attrError.value = ''
  for (const k of Object.keys(attrValues)) delete attrValues[k]
  for (const k of Object.keys(attrFieldErrors)) delete attrFieldErrors[k]
}

function parseAttributesJson(input) {
  if (!input) return {}
  if (typeof input === 'object') return input
  if (typeof input === 'string') {
    const s = input.trim()
    if (!s) return {}
    try {
      const parsed = JSON.parse(s)
      return parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
      return {}
    }
  }
  return {}
}

function initAttrValuesFromDefs(defs, existing = {}) {
  // ensure keys exist with correct base type
  for (const d of defs) {
    const k = d.attr_key
    const t = d.data_type

    const prev = existing?.[k]

    if (t === 'multiselect') {
      // must be array
      attrValues[k] = Array.isArray(prev) ? prev : (prev ? [String(prev)] : [])
    } else if (t === 'bool') {
      attrValues[k] = !!prev
    } else if (t === 'number') {
      attrValues[k] = (prev === '' || prev == null) ? null : (Number.isFinite(+prev) ? +prev : null)
    } else {
      attrValues[k] = (prev === undefined || prev === null) ? '' : String(prev)
    }
  }

  // remove stale keys not in defs (optional but cleaner)
  const allowed = new Set(defs.map(d => d.attr_key))
  for (const k of Object.keys(attrValues)) {
    if (!allowed.has(k)) delete attrValues[k]
  }
}

async function loadAttrDefs(categoryId, existingAttrs = null) {
  clearAttrState()
  if (!categoryId) return

  attrLoading.value = true
  try {
    const resp = await getCategoryAttributeDefs(categoryId)
    const defs = Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp) ? resp : [])
    // normalize options field
    attrDefs.value = defs.map(d => ({
      ...d,
      options: Array.isArray(d.options) ? d.options : (Array.isArray(d.options_json) ? d.options_json : [])
    }))

    const existing = existingAttrs ? parseAttributesJson(existingAttrs) : {}
    initAttrValuesFromDefs(attrDefs.value, existing)
  } catch (e) {
    attrError.value = e?.response?.data?.message || e?.message || 'Failed to load custom fields'
    attrDefs.value = []
  } finally {
    attrLoading.value = false
  }
}

function validateDynamicAttributes() {
  // reset field errors
  for (const k of Object.keys(attrFieldErrors)) delete attrFieldErrors[k]

  const defs = attrDefs.value || []
  for (const d of defs) {
    if (!d.required) continue

    const k = d.attr_key
    const t = d.data_type
    const v = attrValues[k]

    if (t === 'multiselect') {
      if (!Array.isArray(v) || v.length === 0) attrFieldErrors[k] = 'This field is required'
    } else if (t === 'select') {
      if (!v || String(v).trim() === '') attrFieldErrors[k] = 'This field is required'
    } else if (t === 'number') {
      if (v === null || v === '' || Number.isNaN(Number(v))) attrFieldErrors[k] = 'This field is required'
    } else if (t === 'date') {
      if (!v || String(v).trim() === '') attrFieldErrors[k] = 'This field is required'
    } else if (t === 'text') {
      if (!v || String(v).trim() === '') attrFieldErrors[k] = 'This field is required'
    } else if (t === 'bool') {
      // For required bool: we consider false as still "provided".
      // If you want "required means must be checked", uncomment below:
      // if (!v) attrFieldErrors[k] = 'Please check this box'
    }
  }

  return Object.keys(attrFieldErrors).length === 0
}

// ---------- load product ----------
async function loadProduct(id) {
  try {
    hydrating.value = true

    const resp = await api.get(`/products/${id}`)
    const p = resp.data?.data || resp.data

    form.sku = p.sku || ''
    form.name = p.name || ''
    form.model = p.model || ''
    form.category_id = Number(p.category_id)
    form.unit = p.unit || ''
    form.price = Number(p.price || 0)
    form.sale_price = p.sale_price === null ? null : Number(p.sale_price)
    form.reward_points = Number(p.reward_points || 0)
    form.is_reward_eligible = !!p.is_reward_eligible
    form.material = p.material || ''
    form.finish = p.finish || ''
    form.image_url = p.image_url_resolved || p.image_url || ''
    previewUrl.value = ''
    form.active = p.active ? 1 : 0

    if (!brands.value.length) await fetchBrands()
    if (!allCategories.value.length) await fetchCategories('')

    const brandId = p.brand_id != null ? Number(p.brand_id) : null
    const divisionId = p.division_id != null ? Number(p.division_id) : null
    selection.brand_id = brandId
    await fetchDivisions(brandId || '')
    selection.division_id = divisionId
    await fetchCategories(divisionId || '')

    form.category_id = Number(p.category_id)

    // ✅ load dynamic fields for this category, hydrating from product.attributes_json
    await loadAttrDefs(form.category_id, p.attributes_json)
  } catch (e) {
    error.value = 'Failed to load product: ' + (e.response?.data?.message || e.message)
    console.error(e)
  } finally {
    hydrating.value = false
  }
}

function validate() {
  if (!form.category_id) return 'Please select a category.'
  if (!form.sku.trim()) return 'SKU is required.'
  if (!form.name.trim()) return 'Name is required.'
  if (form.price < 0 || (form.sale_price !== null && form.sale_price < 0)) return 'Price values cannot be negative.'
  if (form.sale_price !== null && form.sale_price > form.price) return 'Sale price cannot exceed Rate.'
  if (form.reward_points < 0) return 'Reward points cannot be negative.'
  if (fileBlob.value && fileBlob.value.size > 2 * 1024 * 1024) return 'Please upload up to 2 MB.'

  // ✅ validate dynamic required fields
  const ok = validateDynamicAttributes()
  if (!ok) return 'Please fill all required additional fields.'

  return ''
}

function buildAttributesPayload() {
  // Only include keys from defs
  const defs = attrDefs.value || []
  const out = {}
  for (const d of defs) {
    const k = d.attr_key
    const t = d.data_type
    const v = attrValues[k]

    if (t === 'multiselect') {
      out[k] = Array.isArray(v) ? v : []
    } else if (t === 'number') {
      out[k] = (v === '' || v == null) ? null : (Number.isFinite(+v) ? +v : null)
    } else if (t === 'bool') {
      out[k] = !!v
    } else {
      // text/select/date
      out[k] = (v == null) ? '' : String(v)
    }
  }
  return out
}

// ---------- regional pricing ----------
async function loadRegionalPricing(productId) {
  pricingLoading.value = true
  try {
    await fetchRegions()
    const res = await api.get(`/products/${productId}/regional-pricing`)
    const serverRegions = res.data?.data?.regions ?? []
    // Merge server data with all regions, filling gaps with defaults
    regionalPricing.value = regions.value.map(r => {
      const found = serverRegions.find(sr => sr.region_id === r.id)
      return {
        region_id: r.id,
        region_name: r.name,
        currency_code: r.currency_code,
        currency_symbol: r.currency_symbol,
        price: found?.pricing?.price ?? null,
        sale_price: found?.pricing?.sale_price ?? null,
        reward_points: found?.pricing?.reward_points ?? null,
        is_active: found?.pricing?.is_active ?? 1
      }
    })
  } catch (e) {
    console.error('Failed to load regional pricing', e)
  } finally {
    pricingLoading.value = false
  }
}

async function saveRegionalPricing(productId) {
  pricingSaveError.value = ''
  const rows = regionalPricing.value
    .filter(r => r.price !== null && r.price !== '')
    .map(r => ({
      region_id: r.region_id,
      price: Number(r.price),
      sale_price: r.sale_price !== '' && r.sale_price !== null ? Number(r.sale_price) : null,
      reward_points: r.reward_points !== '' && r.reward_points !== null ? Number(r.reward_points) : 0,
      is_active: r.is_active ? 1 : 0
    }))
  if (!rows.length) return
  await api.put(`/products/${productId}/regional-pricing`, { pricing: rows })
}

watch(pricingOpen, async (open) => {
  if (open && isEditing.value && !regionalPricing.value.length) {
    await loadRegionalPricing(Number(route.params.id))
  } else if (open && !isEditing.value && !regions.value.length) {
    await fetchRegions()
    regionalPricing.value = regions.value.map(r => ({
      region_id: r.id,
      region_name: r.name,
      currency_code: r.currency_code,
      currency_symbol: r.currency_symbol,
      price: null,
      sale_price: null,
      reward_points: null,
      is_active: 1
    }))
  }
})

async function onSubmit() {
  if (saving.value) return
  error.value = ''

  const v = validate()
  if (v) { error.value = v; return }

  const fd = new FormData()
  fd.append('sku', form.sku.trim())
  fd.append('name', form.name.trim())
  fd.append('model', form.model || '')
  fd.append('category_id', String(form.category_id))
  fd.append('unit', form.unit || '')
  fd.append('price', String(form.price ?? 0))
  fd.append('sale_price', form.sale_price == null ? '' : String(form.sale_price))
  fd.append('reward_points', String(form.reward_points ?? 0))
  fd.append('is_reward_eligible', form.is_reward_eligible ? '1' : '0')
  fd.append('material', form.material || '')
  fd.append('finish', form.finish || '')
  fd.append('image_url', form.image_url || '')
  fd.append('active', form.active === 1 ? '1' : '0')

  // ✅ Option A dynamic attributes
  const attrs = buildAttributesPayload()
  fd.append('attributes_json', JSON.stringify(attrs))

  if (fileBlob.value) fd.append('image', fileBlob.value)

  saving.value = true
  if (fileBlob.value) uploading.value = true
  uploadProgress.value = 0
  try {
    const uploadConfig = {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
      onUploadProgress: (progressEvent) => {
        uploadProgress.value = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
      }
    }
    if (isEditing.value) {
      const id = Number(route.params.id)
      await api.put(`/products/${id}`, fd, uploadConfig)
      if (pricingOpen.value) {
        try { await saveRegionalPricing(id) } catch (pe) {
          pricingSaveError.value = 'Regional pricing save failed: ' + (pe.response?.data?.message || pe.message)
        }
      }
      success('Product updated successfully', { timeout: 4000 })
      await router.push({ name: 'ProductList' })
    } else {
      const resp = await api.post('/products', fd, uploadConfig)
      const created = resp.data?.data || resp.data
      if (pricingOpen.value && created?.id) {
        try { await saveRegionalPricing(created.id) } catch (pe) {
          pricingSaveError.value = 'Regional pricing save failed: ' + (pe.response?.data?.message || pe.message)
        }
      }
      success('Product created successfully', {
        timeout: 5000,
        actionLabel: 'View product',
        onAction: () => router.push({ name: 'ProductDetails', params: { id: created.id } })
      })
      await router.push({ name: 'ProductDetails', params: { id: created.id } })
    }
  } catch (e) {
    if (e.code === 'ECONNABORTED') {
      error.value = 'Upload timed out. Please try a smaller image or check your connection.'
    } else {
      error.value = 'Save failed: ' + (e.response?.data?.message || e.message)
    }
    toastError('Failed to save product')
    console.error(e)
  } finally {
    saving.value = false
    uploading.value = false
    uploadProgress.value = 0
  }
}

// ---------- image ----------
function onFileChange(e) {
  uploadError.value = ''
  const f = e.target.files?.[0]
  if (!f) { clearSelectedFile(); return }
  if (!/^image\/(png|jpe?g|webp)$/i.test(f.type) || f.size > 2 * 1024 * 1024) {
    uploadError.value = 'Please upload PNG/JPG/WebP up to 2 MB.'
    clearSelectedFile()
    return
  }
  fileBlob.value = f
  previewUrl.value = URL.createObjectURL(f)
}

function clearSelectedFile() {
  fileBlob.value = null
  previewUrl.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

// ---------- watches ----------
watch(() => selection.brand_id, async (brandId) => {
  if (hydrating.value) return
  selection.division_id = null
  form.category_id = null
  await fetchDivisions(brandId || '')
  categories.value = []
  clearAttrState()
})

watch(() => selection.division_id, async (divisionId) => {
  if (hydrating.value) return
  await fetchCategories(divisionId || '')
  if (!categories.value.some(c => Number(c.id) === Number(form.category_id))) {
    form.category_id = null
    clearAttrState()
  }
})

watch(() => form.category_id, async (categoryId, prev) => {
  if (hydrating.value) return
  if (!categoryId) {
    clearAttrState()
    return
  }

  // When user changes category manually, load defs fresh (no existing attrs)
  // In edit mode, if category changed, reset values to blank/default.
  await loadAttrDefs(categoryId, null)
})

onMounted(async () => {
  await fetchBrands()
  await fetchDivisions('')
  await fetchCategories('')

  if (route.name === 'EditProduct' || route.params.id) {
    isEditing.value = true
    await loadProduct(route.params.id)
  } else {
    // If creating and category already selected by default somewhere, load defs
    if (form.category_id) await loadAttrDefs(form.category_id, null)
  }
})
</script>

<style scoped>
/* Tailwind handles most styles */
</style>
