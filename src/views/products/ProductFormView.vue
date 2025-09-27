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
        <input id="sku" v-model.trim="form.sku" type="text" required
               class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
      </div>

      <!-- Name -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700">
          Name <span class="text-red-500">*</span>
        </label>
        <input id="name" v-model.trim="form.name" type="text" required
               class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
      </div>

      <!-- Brand & Division (filters only for choosing category) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="brand" class="block text-sm font-medium text-gray-700">Brand</label>
          <select id="brand" v-model.number="selection.brand_id" :disabled="!brands.length"
                  class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option :value="null">All Brands</option>
            <option v-for="b in brands" :key="b.id" :value="Number(b.id)">{{ b.name }}</option>
          </select>
        </div>
        <div>
          <label for="division" class="block text-sm font-medium text-gray-700">Division</label>
          <select id="division" v-model.number="selection.division_id" :disabled="!divisions.length"
                  class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100">
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
        <select id="category" v-model.number="form.category_id" required :disabled="!categories.length"
                class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100">
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
          <label for="price" class="block text-sm font-medium text-gray-700">MRP (₹)</label>
          <input id="price" v-model.number="form.price" type="number" step="0.01" min="0" required
                 class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
        </div>
        <div>
          <label for="sale_price" class="block text-sm font-medium text-gray-700">Sale Price (₹, optional)</label>
          <input id="sale_price" v-model.number="form.sale_price" type="number" step="0.01" min="0"
                 class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Leave blank if none"/>
        </div>
      </div>

      <!-- Rewards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="reward_points" class="block text-sm font-medium text-gray-700">Reward Points</label>
          <input id="reward_points" v-model.number="form.reward_points" type="number" min="0"
                 class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
        </div>
        <div class="flex items-center gap-2 mt-6 sm:mt-8">
          <input id="eligible" type="checkbox" v-model="form.is_reward_eligible" class="h-4 w-4"/>
          <label for="eligible" class="text-sm">Reward eligible</label>
        </div>
      </div>

      <!-- Attributes -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label for="unit" class="block text-sm font-medium text-gray-700">Unit</label>
          <input id="unit" v-model.trim="form.unit" class="mt-1 block w-full border rounded px-3 py-2" placeholder="e.g., pcs, box"/>
        </div>
        <div>
          <label for="material" class="block text-sm font-medium text-gray-700">Material</label>
          <input id="material" v-model.trim="form.material" class="mt-1 block w-full border rounded px-3 py-2" placeholder="e.g., Stainless Steel"/>
        </div>
        <div>
          <label for="finish" class="block text-sm font-medium text-gray-700">Finish</label>
          <input id="finish" v-model.trim="form.finish" class="mt-1 block w-full border rounded px-3 py-2" placeholder="e.g., SS Chrome/SS Matt"/>
        </div>
      </div>

      <!-- Image (dealer-like: file input + preview; submitted in same request) -->
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
            <img :src="previewFull" alt="Preview" class="h-20 w-20 rounded object-cover border bg-white"/>
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

      <div class="flex justify-end gap-2">
        <router-link :to="{ name: 'ProductList' }" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
          Cancel
        </router-link>
        <button type="submit" :disabled="saving"
                class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
          {{ saving ? (isEditing ? 'Updating…' : 'Creating…') : (isEditing ? 'Update' : 'Create') }}
        </button>
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

const router = useRouter()
const route = useRoute()
const { success, error: toastError } = useToast()

const isEditing = ref(false)
const saving = ref(false)
const error = ref('')
const hydrating = ref(false)

// --- image upload state (dealer-like) ---
const uploadError = ref('')
const fileInput = ref(null)
const fileBlob = ref(null)
const previewUrl = ref('')      // ObjectURL or absolute link

// --- form (DB columns) ---
const form = reactive({
  sku: '', name: '', category_id: null, unit: '',
  price: 0, sale_price: null,
  reward_points: 0, is_reward_eligible: true,
  material: '', finish: '',
  image_url: '',   // server may return absolute or /uploads path
  active: 1
})

// --- filters for category ---
const selection = reactive({ brand_id: null, division_id: null })
const brands = ref([]); const divisions = ref([]); const categories = ref([]); const allCategories = ref([])

const previewFull = computed(() =>
  previewUrl.value ? previewUrl.value : (form.image_url ? resolveImageUrl(form.image_url) : '')
)

// ---------------- helpers ----------------
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

// ---------------- fetchers ----------------
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
async function fetchCategories(divisionId = '') {
  try {
    if (divisionId) {
      try {
        categories.value = pluckArray(await api.get('/categories', { params: { division_id: divisionId, limit: 1000 } })).filter(x => !x.deleted_at)
        return
      } catch {}
      categories.value = pluckArray(await api.get(`/categories/division/${divisionId}`)).filter(x => !x.deleted_at)
      return
    }
    const all = pluckArray(await api.get('/categories', { params: { limit: 1000 } })).filter(x => !x.deleted_at)
    allCategories.value = all; categories.value = all
  } catch { categories.value = [] }
}

// -------------- load product --------------
async function loadProduct(id) {
  try {
    hydrating.value = true

    const resp = await api.get(`/products/${id}`)
    const p = resp.data?.data || resp.data

    form.sku = p.sku || ''
    form.name = p.name || ''
    form.category_id = Number(p.category_id)
    form.unit = p.unit || ''
    form.price = Number(p.price || 0)
    form.sale_price = p.sale_price === null ? null : Number(p.sale_price)
    form.reward_points = Number(p.reward_points || 0)
    form.is_reward_eligible = !!p.is_reward_eligible
    form.material = p.material || ''
    form.finish = p.finish || ''
    form.image_url = p.image_url_resolved || p.image_url || ''
    previewUrl.value = '' // we only show selected file preview; saved image shown via form.image_url
    form.active = p.active ? 1 : 0

    // ensure lists are ready
    if (!brands.value.length) await fetchBrands()
    if (!allCategories.value.length) await fetchCategories('')

    // set brand/division DIRECTLY from product response (your API returns these)
    const brandId    = p.brand_id    != null ? Number(p.brand_id)    : null
    const divisionId = p.division_id != null ? Number(p.division_id) : null
    selection.brand_id = brandId
    await fetchDivisions(brandId || '')
    selection.division_id = divisionId
    await fetchCategories(divisionId || '')

    form.category_id = Number(p.category_id)
  } catch (e) {
    error.value = 'Failed to load product: ' + (e.response?.data?.message || e.message)
    console.error(e)
  } finally {
    hydrating.value = false
  }
}

// -------------- validations --------------
function validate() {
  if (!form.category_id) return 'Please select a category.'
  if (!form.sku.trim())  return 'SKU is required.'
  if (!form.name.trim()) return 'Name is required.'
  if (form.price < 0 || (form.sale_price !== null && form.sale_price < 0)) return 'Price values cannot be negative.'
  if (form.sale_price !== null && form.sale_price > form.price) return 'Sale price cannot exceed MRP.'
  if (form.reward_points < 0) return 'Reward points cannot be negative.'
  if (fileBlob.value && fileBlob.value.size > 2 * 1024 * 1024) return 'Please upload up to 2 MB.'
  return ''
}

// -------------- submit (multipart like Dealer) --------------
async function onSubmit() {
  if (saving.value) return
  error.value = ''

  const v = validate()
  if (v) { error.value = v; return }

  // Build multipart/form-data (server will parse and also accept body strings)
  const fd = new FormData()
  fd.append('sku', form.sku.trim())
  fd.append('name', form.name.trim())
  fd.append('category_id', String(form.category_id))
  fd.append('unit', form.unit || '')
  fd.append('price', String(form.price ?? 0))
  fd.append('sale_price', form.sale_price == null ? '' : String(form.sale_price))
  fd.append('reward_points', String(form.reward_points ?? 0))
  fd.append('is_reward_eligible', form.is_reward_eligible ? '1' : '0')
  fd.append('material', form.material || '')
  fd.append('finish', form.finish || '')
  fd.append('image_url', form.image_url || '') // if user pasted a URL
  fd.append('active', form.active === 1 ? '1' : '0')

  if (fileBlob.value) {
    fd.append('image', fileBlob.value) // <---- matches backend multer.single('image')
  }

  saving.value = true
  try {
    if (isEditing.value) {
      const id = Number(route.params.id)
      await api.put(`/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      success('Product updated successfully', { timeout: 4000 })
      await router.push({ name: 'ProductList' })
    } else {
      const resp = await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      const created = resp.data?.data || resp.data
      success('Product created successfully', {
        timeout: 5000,
        actionLabel: 'Edit product',
        onAction: () => router.push({ name: 'EditProduct', params: { id: created.id } })
      })
      await router.push({ name: 'EditProduct', params: { id: created.id } })
    }
  } catch (e) {
    error.value = 'Save failed: ' + (e.response?.data?.message || e.message)
    toastError('Failed to save product')
    console.error(e)
  } finally {
    saving.value = false
  }
}

// -------------- image handlers --------------
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

// ---------------- watchers & mount ----------------
watch(() => selection.brand_id, async (brandId) => {
  if (hydrating.value) return
  selection.division_id = null
  form.category_id = null
  await fetchDivisions(brandId || '')
  categories.value = []
})
watch(() => selection.division_id, async (divisionId) => {
  if (hydrating.value) return
  await fetchCategories(divisionId || '')
  if (!categories.value.some(c => Number(c.id) === Number(form.category_id))) {
    form.category_id = null
  }
})

onMounted(async () => {
  await fetchBrands()
  await fetchDivisions('')
  await fetchCategories('')
  if (route.name === 'EditProduct' || route.params.id) {
    isEditing.value = true
    await loadProduct(route.params.id)
  }
})
</script>

<style scoped>
/* Tailwind handles most styles */
</style>
