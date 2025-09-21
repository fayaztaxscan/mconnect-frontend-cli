<!-- src/views/Dealers/DealersForm.vue (or src/views/settings/Dealers/DealersForm.vue) -->
<template>
  <div class="p-6 max-w-3xl">
    <h2 class="text-xl font-semibold mb-4">
      {{ isEdit ? 'Edit Dealer' : 'Add Dealer' }}
    </h2>

    <!-- Alerts -->
    <p v-if="error" class="mb-3 text-sm text-red-600">{{ error }}</p>
    <p v-if="success" class="mb-3 text-sm text-emerald-700">{{ success }}</p>

    <form @submit.prevent="handleSubmit" class="space-y-5">
      <!-- Basic info -->
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm mb-1">Dealer Name <span class="text-red-500">*</span></label>
          <input v-model.trim="form.name" required class="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm mb-1">Dealer Code <span class="text-red-500">*</span></label>
          <input v-model.trim="form.dealer_code" required class="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label class="block text-sm mb-1">Email</label>
          <input v-model.trim="form.email" type="email" class="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm mb-1">Phone</label>
          <input v-model.trim="form.primary_contact_phone" class="w-full border rounded px-3 py-2" />
        </div>

        <div class="sm:col-span-2">
          <label class="block text-sm mb-1">Primary Contact Name</label>
          <input v-model.trim="form.primary_contact_name" class="w-full border rounded px-3 py-2" />
        </div>
      </div>

      <!-- Brand + Website -->
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm mb-1">Brand</label>
          <select v-model.number="form.brand_id" class="w-full border rounded px-3 py-2">
            <option :value="null">Select brand</option>
            <option v-for="b in brands" :key="b.id" :value="Number(b.id)">
              {{ b.name }}
            </option>
          </select>
          <p v-if="brandsLoading" class="text-xs text-slate-500 mt-1">Loading brands…</p>
        </div>

        <div>
          <label class="block text-sm mb-1">Website</label>
          <input
            v-model.trim="form.website_url"
            type="url"
            placeholder="https://example.com"
            class="w-full border rounded px-3 py-2"
          />
          <p class="text-xs text-slate-500 mt-1">You can also enter just domain (e.g., mydealer.in)</p>
        </div>
      </div>

      <!-- Address -->
      <div>
        <label class="block text-sm mb-1">Full Address</label>
        <textarea v-model="form.address" rows="3" class="w-full border rounded px-3 py-2"></textarea>
      </div>

      <div class="grid sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm mb-1">City</label>
          <input v-model.trim="form.city" class="w-full border rounded px-3 py-2" />
        </div>

        <!-- Region select -->
        <div>
          <label class="block text-sm mb-1">Region</label>
          <select v-model.number="form.region_id" class="w-full border rounded px-3 py-2">
            <option :value="null">Select region</option>
            <option v-for="r in regions" :key="r.id" :value="Number(r.id)">
              {{ r.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm mb-1">Postal Code</label>
          <input v-model.trim="form.postal_code" class="w-full border rounded px-3 py-2" />
        </div>
      </div>

      <!-- Status -->
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm mb-1">Status</label>
          <select v-model="form.status" class="w-full border rounded px-3 py-2">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <!-- Logo upload + preview -->
      <div class="grid sm:grid-cols-[1fr_auto] gap-4 items-start">
        <div>
          <label class="block text-sm mb-1">Logo</label>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="onFileChange"
            class="block w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <p class="text-xs text-slate-500 mt-1">PNG/JPG up to 8 MB.</p>
        </div>

        <div class="justify-self-end">
          <div v-if="logoPreview || form.logo_url" class="flex flex-col items-center">
            <img
              :src="logoPreview || form.logo_url"
              alt="Dealer Logo"
              class="h-16 w-16 object-contain border rounded bg-white"
            />
            <button
              v-if="logoPreview"
              type="button"
              @click="clearSelectedFile"
              class="mt-2 text-xs text-slate-600 hover:text-slate-900 underline"
            >
              Remove selected
            </button>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button
          type="submit"
          :disabled="submitting"
          class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
        >
          <span v-if="!submitting">{{ isEdit ? 'Update' : 'Create' }}</span>
          <span v-else>Saving…</span>
        </button>
        <router-link :to="{ name: 'DealersList' }" class="px-4 py-2 border rounded">Cancel</router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDealer, createDealer, updateDealer } from '@/services/dealers'
import { listRegions } from '@/services/regions'
import { listBrands } from '@/services/brands'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => Boolean(route.params.id))
const submitting = ref(false)
const error = ref('')
const success = ref('')

// Regions / Brands
const regions = ref([])
const brands = ref([])
const brandsLoading = ref(false)

// Form model
const form = reactive({
  name: '',
  dealer_code: '',
  email: '',
  primary_contact_phone: '',
  primary_contact_name: '',
  address: '',
  city: '',
  postal_code: '',
  region_id: null,
  status: 'active',
  logo_url: '',
  brand_id: null,
  website_url: ''
})

const fileInput = ref(null)
const fileBlob = ref(null)
const logoPreview = ref('')

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) {
    fileBlob.value = null
    logoPreview.value = ''
    return
  }
  fileBlob.value = file
  logoPreview.value = URL.createObjectURL(file)
}

function clearSelectedFile() {
  fileBlob.value = null
  logoPreview.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

async function load(id) {
  if (!id) return
  try {
    const data = await getDealer(id)
    form.name = data.name ?? ''
    form.dealer_code = data.dealer_code ?? ''
    form.email = data.email ?? ''
    form.primary_contact_phone = data.primary_contact_phone ?? ''
    form.primary_contact_name = data.primary_contact_name ?? ''
    form.address = data.address ?? ''
    form.city = data.city ?? ''
    form.postal_code = data.postal_code ?? ''
    form.region_id = data.region_id != null ? Number(data.region_id) : null
    form.status = data.status ?? 'active'
    form.logo_url = data.logo_url ?? ''
    form.brand_id = data.brand_id != null ? Number(data.brand_id) : null
    form.website_url = data.website_url ?? ''
  } catch (e) {
    console.error(e)
    error.value = 'Failed to load dealer'
  }
}

onMounted(async () => {
  try {
    regions.value = await listRegions()
  } catch (e) {
    console.error(e)
  }
  try {
    brandsLoading.value = true
    const arr = await listBrands()
    brands.value = Array.isArray(arr) ? arr : (arr?.data ?? [])
  } catch (e) {
    console.error('Failed to load brands', e)
  } finally {
    brandsLoading.value = false
  }
  await load(route.params.id)
})

// If navigating /dealers/1/edit → /dealers/2/edit reusing component
watch(() => route.params.id, (id) => load(id))

async function handleSubmit() {
  error.value = ''
  success.value = ''
  if (!form.name?.trim() || !form.dealer_code?.trim()) {
    error.value = 'Dealer Name and Dealer Code are required.'
    return
  }

  // Build multipart/form-data (supports logo upload via field 'logo')
  const fd = new FormData()
  fd.append('name', form.name.trim())
  fd.append('dealer_code', form.dealer_code.trim())

  // always append these so clearing -> server sees '' and can NULL them
  fd.append('email', (form.email ?? '').trim())
  fd.append('primary_contact_phone', (form.primary_contact_phone ?? '').trim())
  fd.append('primary_contact_name', (form.primary_contact_name ?? '').trim())
  fd.append('address', form.address ?? '')
  fd.append('city', (form.city ?? '').trim())
  fd.append('postal_code', (form.postal_code ?? '').trim())

  // Region: send '' if null so backend can clear it
  fd.append('region_id', form.region_id == null ? '' : String(form.region_id))

  // Status: always send
  fd.append('status', form.status || 'active')

  // Brand: send '' if null so backend can clear it
  fd.append('brand_id', form.brand_id == null ? '' : String(form.brand_id))

  // Website: send raw value; backend will normalize '' -> NULL or add scheme
  fd.append('website_url', (form.website_url ?? '').trim())

  if (fileBlob.value) {
    fd.append('logo', fileBlob.value) // routes expect 'logo' field
  }

  submitting.value = true
  try {
    if (isEdit.value) {
      await updateDealer(route.params.id, fd)
      success.value = 'Dealer updated'
    } else {
      await createDealer(fd)
      success.value = 'Dealer created'
    }
    router.push({ name: 'DealersList' })
  } catch (e) {
    console.error(e)
    if (e?.response?.status === 409) {
      error.value = 'Dealer code already exists.'
    } else if (e?.response?.data?.error) {
      error.value = e.response.data.error
    } else {
      error.value = 'Failed to save dealer'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* Tailwind handles styling */
</style>
