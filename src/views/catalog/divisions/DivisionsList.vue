<!-- src/views/catalog/divisions/DivisionsList.vue -->
<template>
  <div class="p-4 max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">Divisions</h1>
      <router-link
        :to="{ name: 'DivisionCreate' }"
        class="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
      >
        Add Division
      </router-link>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-3">
      <select v-model="brandId" @change="fetchData" class="border rounded px-3 py-2">
        <option value="">All Brands</option>
        <option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</option>
      </select>

      <input
        v-model="q"
        @keyup.enter="fetchData"
        placeholder="Search name…"
        class="border rounded px-3 py-2 w-64"
      />

      <select v-model="active" @change="fetchData" class="border rounded px-3 py-2">
        <option value="">All</option>
        <option value="1">Active</option>
        <option value="0">Inactive</option>
      </select>

      <button class="border rounded px-3 py-2" @click="fetchData">Filter</button>
      <button class="border rounded px-3 py-2" @click="resetFilters">Reset</button>
    </div>

    <!-- Table -->
    <div class="bg-white border rounded overflow-x-auto">
      <table class="w-full text-sm min-w-[720px]">
        <thead class="bg-slate-50 text-left">
          <tr>
            <th class="p-3">Brand</th>
            <th class="p-3">Name</th>
            <th class="p-3">Active</th>
            <th class="p-3 w-40">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="4" class="p-6 text-center text-slate-500">Loading…</td>
          </tr>
          <tr v-else-if="error">
            <td colspan="4" class="p-6 text-center text-red-600">{{ error }}</td>
          </tr>
          <tr v-else-if="rows.length === 0">
            <td colspan="4" class="p-6 text-center text-slate-500">No divisions found</td>
          </tr>

          <tr v-else v-for="d in rows" :key="d.id" class="border-t">
            <td class="p-3">{{ d.brand_name ?? d.brandName ?? '-' }}</td>
            <td class="p-3">{{ d.name }}</td>
            <td class="p-3">
              <span :class="(d.active === 1 || d.active === true) ? 'text-emerald-700' : 'text-slate-500'">
                {{ (d.active === 1 || d.active === true) ? 'Yes' : 'No' }}
              </span>
            </td>
            <td class="p-3">
              <div class="flex gap-2">
                <router-link
                  :to="{ name: 'DivisionEdit', params: { id: d.id } }"
                  class="px-3 py-1 rounded border hover:bg-slate-50"
                >
                  Edit
                </router-link>
                <button
                  @click="remove(d.id)"
                  class="px-3 py-1 rounded border text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Small-screen cards (optional; shown if you prefer a card view on mobile) -->
    <div class="mt-4 grid gap-3 sm:hidden">
      <div
        v-for="d in rows"
        :key="'card-' + d.id"
        class="rounded border bg-white p-3"
      >
        <div class="text-xs text-slate-500">{{ d.brand_name ?? d.brandName ?? '-' }}</div>
        <div class="font-medium">{{ d.name }}</div>
        <div class="mt-1">
          <span class="text-xs"
                :class="(d.active === 1 || d.active === true) ? 'text-emerald-700' : 'text-slate-500'">
            {{ (d.active === 1 || d.active === true) ? 'Active' : 'Inactive' }}
          </span>
        </div>
        <div class="mt-3 flex gap-2">
          <router-link
            :to="{ name: 'DivisionEdit', params: { id: d.id } }"
            class="px-3 py-1 rounded border text-sm"
          >
            Edit
          </router-link>
          <button
            @click="remove(d.id)"
            class="px-3 py-1 rounded border text-sm text-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listDivisions, deleteDivision } from '@/services/divisions'
import { listBrands } from '@/services/brandsApi'

const rows = ref([])
const brands = ref([])
const brandId = ref('')
const q = ref('')
const active = ref('')
const loading = ref(false)
const error = ref('')

function resetFilters() {
  brandId.value = ''
  q.value = ''
  active.value = ''
  fetchData()
}

async function fetchData() {
  loading.value = true
  error.value = ''
  try {
    const params = {
      q: q.value || undefined,
      brand_id: brandId.value || undefined,
      active: active.value !== '' ? active.value : undefined
    }
    const data = await listDivisions(params)
    // Accept either {items: []} or bare array
    rows.value = Array.isArray(data) ? data : (data.items ?? data.rows ?? [])
  } catch (e) {
    error.value = e?.response?.data?.error || 'Failed to load divisions'
    rows.value = []
  } finally {
    loading.value = false
  }
}

async function remove(id) {
  if (!confirm('Delete this division?')) return
  await deleteDivision(id)
  fetchData()
}

onMounted(async () => {
  try {
    const b = await listBrands()
    brands.value = Array.isArray(b) ? b : (b.items ?? b.rows ?? [])
  } catch (_) {
    brands.value = []
  }
  fetchData()
})
</script>
