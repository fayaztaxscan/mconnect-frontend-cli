<!-- src/views/catalog/divisions/DivisionForm.vue -->
<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h2 class="text-xl font-semibold mb-4">
      {{ isEdit ? 'Edit Division' : 'Create Division' }}
    </h2>

    <form @submit.prevent="submit" class="space-y-6">
      <div class="grid sm:grid-cols-2 gap-4">
        <!-- Brand -->
        <div>
          <label class="block text-sm mb-1">Brand <span class="text-red-600">*</span></label>
          <select v-model="form.brand_id" class="w-full border rounded px-3 py-2" required>
            <option disabled value="">Select brand…</option>
            <option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</option>
          </select>
          <p v-if="errors.brand_id" class="text-xs text-red-600 mt-1">{{ errors.brand_id }}</p>
        </div>

        <!-- Name -->
        <div>
          <label class="block text-sm mb-1">Name <span class="text-red-600">*</span></label>
          <input v-model.trim="form.name" class="w-full border rounded px-3 py-2" required />
          <p v-if="errors.name" class="text-xs text-red-600 mt-1">{{ errors.name }}</p>
        </div>

        <!-- Optional image URL (exists in schema) -->
        <div class="sm:col-span-2">
          <label class="block text-sm mb-1">Image URL (optional)</label>
          <input v-model.trim="form.image_url" class="w-full border rounded px-3 py-2" placeholder="https://…" />
        </div>
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm mb-1">Description</label>
        <textarea v-model.trim="form.description" rows="3" class="w-full border rounded px-3 py-2"></textarea>
      </div>

      <!-- Active -->
      <label class="inline-flex items-center gap-2">
        <input type="checkbox" v-model="form.active" />
        <span>Active</span>
      </label>

      <div class="flex flex-wrap gap-3 items-center">
        <button
          type="submit"
          :disabled="saving"
          class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
        >
          {{ saving ? (isEdit ? 'Updating…' : 'Creating…') : (isEdit ? 'Update' : 'Create') }}
        </button>
        <router-link :to="{ name: 'DivisionsList' }" class="px-4 py-2 border rounded">Cancel</router-link>
        <span v-if="error" class="text-red-600 text-sm">{{ error }}</span>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDivision, createDivision, updateDivision } from '@/services/divisions'
import { listBrands } from '@/services/brandsApi'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => Boolean(route.params.id))
const brands = ref([])
const saving = ref(false)
const error = ref('')
const errors = reactive({ brand_id: '', name: '' })

// Form model aligned to schema: divisions(brand_id, name, description, image_url, active)
const form = reactive({
  brand_id: '',
  name: '',
  description: '',
  image_url: '',
  active: true, // boolean in UI; convert to 1/0 for API if needed
})

function validate() {
  errors.brand_id = !form.brand_id ? 'Brand is required' : ''
  errors.name = !form.name?.trim() ? 'Name is required' : ''
  return !(errors.brand_id || errors.name)
}

onMounted(async () => {
  // Brands for dropdown
  try {
    const b = await listBrands()
    brands.value = Array.isArray(b) ? b : (b.items ?? b.rows ?? [])
  } catch (_) {
    brands.value = []
  }

  // Populate for edit
  if (isEdit.value) {
    const d = await getDivision(route.params.id)
    form.brand_id = d.brand_id ?? ''
    form.name = d.name ?? ''
    form.description = d.description ?? ''
    form.image_url = d.image_url ?? ''
    // backend may return 1/0 or true/false
    form.active = d.active === 1 || d.active === true
  }
})

async function submit() {
  if (!validate()) return

  try {
    saving.value = true
    error.value = ''
    // Ensure backend receives tinyint/number if it expects 1/0
    const payload = {
      brand_id: form.brand_id,
      name: form.name,
      description: form.description || null,
      image_url: form.image_url || null,
      active: form.active ? 1 : 0,
    }

    if (isEdit.value) {
      await updateDivision(route.params.id, payload)
    } else {
      await createDivision(payload)
    }
    router.push({ name: 'DivisionsList' })
  } catch (e) {
    error.value = e?.response?.data?.error || 'Failed to save division'
  } finally {
    saving.value = false
  }
}
</script>
