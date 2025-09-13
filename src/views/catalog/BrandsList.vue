<template>
  <div class="p-4 max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">Brands</h1>
      <router-link
        :to="{ name: 'BrandCreate' }"
        class="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
      >
        Add Brand
      </router-link>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-3 mb-3">
      <input
        v-model="q"
        type="text"
        placeholder="Search by name…"
        class="px-3 py-2 border rounded w-64"
        @keyup.enter="applyFilters"
      />
      <select v-model="active" class="px-3 py-2 border rounded">
        <option value="">All</option>
        <option value="1">Active</option>
        <option value="0">Inactive</option>
      </select>
      <button @click="applyFilters" class="px-3 py-2 border rounded">Filter</button>
      <button v-if="q || active!==''" @click="resetFilters" class="px-3 py-2 border rounded">
        Reset
      </button>
    </div>

    <!-- Content -->
    <div class="bg-white rounded border overflow-x-auto">
      <table class="w-full text-sm min-w-[720px]">
        <thead class="bg-slate-50 text-left">
          <tr>
            <th class="p-3">Logo</th>
            <th class="p-3">Name</th>
            <th class="p-3">Description</th>
            <th class="p-3">Active</th>
            <th class="p-3 w-40">Actions</th>
          </tr>
        </thead>

        <tbody>
          <!-- Loading row -->
          <tr v-if="loading">
            <td colspan="5" class="p-6 text-center text-slate-500">Loading…</td>
          </tr>

          <!-- Error row -->
          <tr v-else-if="error">
            <td colspan="5" class="p-6 text-center text-red-600">
              {{ error }}
            </td>
          </tr>

          <!-- Data rows -->
          <tr v-else v-for="b in rows" :key="b.id" class="border-t">
            <td class="p-3">
              <img
                v-if="b.image_url"
                :src="resolveImageUrl(b.image_url)"
                alt=""
                class="h-9 w-auto rounded object-contain"
              />
            </td>
            <td class="p-3 font-medium">{{ b.name }}</td>
            <td class="p-3 text-slate-600 line-clamp-2">{{ b.description }}</td>
            <td class="p-3">
              <span :class="b.active ? 'text-emerald-700' : 'text-slate-500'">
                {{ b.active ? 'Yes' : 'No' }}
              </span>
            </td>
            <td class="p-3">
              <div class="flex gap-2">
                <router-link
                  :to="{ name: 'BrandEdit', params: { id: b.id } }"
                  class="px-3 py-1 rounded border"
                >
                  Edit
                </router-link>
                <button
                  @click="remove(b.id)"
                  class="px-3 py-1 rounded border text-red-600"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>

          <!-- Empty row -->
          <tr v-if="!loading && !error && rows.length === 0">
            <td colspan="5" class="p-6 text-center text-slate-500">
              No brands found
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listBrands, deleteBrand } from '@/services/brandsApi'
import { resolveImageUrl } from '@/utils/imageUrl' // keep your existing helper

const rows = ref([])
const q = ref('')
const active = ref('')
const loading = ref(false)
const error = ref('')

async function fetchData() {
  loading.value = true
  error.value = ''
  try {
    const data = await listBrands({ q: q.value, active: active.value })
    // backend returns { items, page, pageSize } → use items consistently
    rows.value = Array.isArray(data?.items) ? data.items : []
  } catch (e) {
    // common: 401/invalid token → surface it clearly
    const msg = e?.response?.data?.message || e?.message || 'Failed to fetch brands'
    error.value = msg
    rows.value = []
    // optional: if 401, you could route to login page here
    // if (e?.response?.status === 401) router.push({ name: 'Login' })
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  fetchData()
}

function resetFilters() {
  q.value = ''
  active.value = ''
  fetchData()
}

async function remove(id) {
  if (!confirm('Delete this brand?')) return
  await deleteBrand(id)
  fetchData()
}

onMounted(fetchData)
</script>
``