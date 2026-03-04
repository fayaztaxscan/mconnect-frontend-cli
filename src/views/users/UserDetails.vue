<template>
  <div class="p-4 max-w-md mx-auto mt-8">
    <h1 class="text-2xl font-semibold mb-4">User Details</h1>

    <div v-if="loading" class="text-center py-8">Loading...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>

    <div v-else class="space-y-2 bg-white p-6 rounded-lg shadow-md">
      <p><strong>Name:</strong> {{ user.display_name }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <template v-if="user.phone">
        <p><strong>Phone:</strong> {{ user.phone }}</p>
      </template>
      <template v-if="user.preferred_language_name">
        <p><strong>Preferred Language:</strong> {{ user.preferred_language_name }}</p>
      </template>
      <p><strong>Role:</strong> {{ user.role_name }}</p>
      <p><strong>Region:</strong> {{ user.region_name }}</p>

      <!-- Retail Staff shop -->
      <template v-if="user.role_name === 'Retail Staff' && user.shop_name">
        <p><strong>Shop:</strong> {{ user.shop_name }}</p>
      </template>

      <!-- CSR assigned shops -->
      <template v-if="user.role_name === 'CSR' && user.csr_shops">
        <p><strong>Assigned Shops:</strong> {{ user.csr_shops }}</p>
      </template>

      <template v-if="user.brand_id">
        <p><strong>Brand:</strong> {{ user.brand_name }}</p>
      </template>
      <template v-if="user.division_id">
        <p><strong>Division:</strong> {{ user.division_name }}</p>
      </template>
      <template v-if="user.dealer_id">
        <p><strong>Dealer:</strong> {{ user.dealer_name }}</p>
      </template>
      <template v-if="user.tier">
        <p><strong>Tier:</strong> {{ user.tier }}</p>
      </template>
      <template v-if="user.status">
        <p><strong>Status:</strong> {{ user.status }}</p>
      </template>
      <p><strong>Active:</strong> {{ Number(user.is_active) === 1 ? 'Yes' : 'No' }}</p>
      <template v-if="createdByName">
        <p><strong>Created By:</strong> {{ createdByName }}</p>
      </template>
      <template v-if="updatedByName">
        <p><strong>Updated By:</strong> {{ updatedByName }}</p>
      </template>
      <p><strong>Created At:</strong> {{ formatDate(user.created_at) }}</p>
      <p><strong>Updated At:</strong> {{ formatDate(user.updated_at) }}</p>
    </div>

    <div class="mt-6 flex space-x-3 justify-end">
      <router-link
        :to="{ name: 'EditUser', params: { id } }"
        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Edit
      </router-link>
      <router-link
        :to="{ name: 'ManageUsers' }"
        class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        Back
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

const route          = useRoute()
const id             = route.params.id
const user           = ref({})
const loading        = ref(false)
const error          = ref('')
const languages      = ref([])
const createdByName  = ref('')
const updatedByName  = ref('')

function formatDate(ts) {
  return ts ? new Date(ts).toLocaleString() : '—'
}

// ✅ unwrap helpers (fixes your issue)
function unwrapObject(payload) {
  // supports {success:true,data:{...}} OR direct object
  if (payload && typeof payload === 'object' && payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    return payload.data
  }
  return payload || {}
}

function unwrapArray(payload) {
  // supports [] | {data: []} | {success:true,data: []}
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

async function fetchDetails() {
  loading.value = true
  error.value   = ''

  try {
    const [userRes, langsRes] = await Promise.all([
      api.get(`/users/${id}`),
      api.get('/localization/languages')
    ])

    // ✅ FIX: correct nesting
    const u = unwrapObject(userRes.data)
    user.value = u

    // ✅ FIX: languages may be wrapped
    languages.value = unwrapArray(langsRes.data)

    // Map language code -> name (without breaking reactivity)
    const lang = languages.value.find(l => l.code === user.value.preferred_language)
    user.value.preferred_language_name = lang ? lang.name : user.value.preferred_language

    // Fetch creator/updater names (also wrapped!)
    const creatorId = user.value.created_by
    const updaterId = user.value.updated_by

    const [creatorRes, updaterRes] = await Promise.all([
      creatorId ? api.get(`/users/${creatorId}`) : Promise.resolve({ data: { success: true, data: { display_name: '—' } } }),
      updaterId ? api.get(`/users/${updaterId}`) : Promise.resolve({ data: { success: true, data: { display_name: '—' } } }),
    ])

    const creatorObj = unwrapObject(creatorRes.data)
    const updaterObj = unwrapObject(updaterRes.data)

    createdByName.value = creatorObj.display_name || '—'
    updatedByName.value = updaterObj.display_name || '—'

  } catch (err) {
    console.error('Failed to load user details:', err)
    error.value = err?.response?.data?.error || err?.message || 'Failed to load user'
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetails)
</script>

<style scoped>
/* All styling via Tailwind */
</style>
