<template>
  <div class="p-4 sm:p-6 max-w-7xl mx-auto">
    <!-- Filters + New -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full sm:w-auto">
        <div>
          <label class="block text-sm font-medium mb-1">Division</label>
          <select v-model.number="filters.division_id" @change="reload" class="w-full border rounded px-3 py-2">
            <option value="">All</option>
            <option v-for="d in divisions" :key="d.id" :value="d.id">{{ d.name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Parent</label>
          <select v-model="filters.parent_id" @change="reload" class="w-full border rounded px-3 py-2">
            <option value="">Any</option>
            <option value="null">Root only</option>
            <option v-for="c in parentOptions" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Status</label>
          <select v-model="filters.active" @change="reload" class="w-full border rounded px-3 py-2">
            <option value="">Any</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div class="flex items-end gap-2">
          <div class="flex-1">
            <label class="block text-sm font-medium mb-1">Search</label>
            <input
              v-model="filters.q"
              @keyup.enter="reload"
              placeholder="Name/Description"
              class="w-full border rounded px-3 py-2"
            />
          </div>
          <button @click="reload" class="px-3 py-2 border rounded">Go</button>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <label class="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="filters.includeDeleted" @change="reload" />
          Show deleted
        </label>

        <button @click="openCreate" class="px-4 py-2 bg-indigo-600 text-white rounded shadow">
          + New Category
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white shadow rounded overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-slate-700">
          <tr>
            <th class="px-4 py-2 text-left">Name</th>
            <th class="px-4 py-2 text-left">Division</th>
            <th class="px-4 py-2 text-left">Parent</th>
            <th class="px-4 py-2">Active</th>
            <th class="px-4 py-2 text-left">Updated</th>
            <th class="px-4 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in items" :key="c.id" class="border-t">
            <td class="px-4 py-2">
              <div class="flex items-center gap-3">
                <img v-if="c.image_url" :src="c.image_url" alt="" class="h-8 w-8 rounded object-cover" />
                <div>
                  <div class="font-medium">{{ c.name }}</div>
                  <div v-if="c.description" class="text-slate-500 text-xs truncate max-w-[28ch]">
                    {{ c.description }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-4 py-2">{{ c.division_name || divisionName(c.division_id) }}</td>
            <td class="px-4 py-2">{{ c.parent_name || '—' }}</td>
            <td class="px-4 py-2 text-center">
              <span
                :class="c.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'"
                class="px-2 py-1 rounded text-xs"
              >
                {{ c.active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-4 py-2">{{ formatDate(c.updated_at) }}</td>
            <td class="px-4 py-2">
              <div class="flex justify-end gap-2">
                <button @click="openEdit(c)" class="px-3 py-1 border rounded">Edit</button>

                <button
                  v-if="!c.deleted_at"
                  @click="confirmDelete(c)"
                  class="px-3 py-1 border rounded text-red-600"
                >
                  Delete
                </button>

                <button
                  v-else
                  @click="confirmRestore(c)"
                  class="px-3 py-1 border rounded text-emerald-700"
                >
                  Restore
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="!loading && items.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-slate-500">
              No categories found
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between mt-4">
      <div class="text-sm text-slate-600">
        Showing page {{ meta.page }} of {{ totalPages }}, total {{ meta.total }}
      </div>
      <div class="flex gap-2">
        <button
          :disabled="meta.page <= 1"
          @click="goto(meta.page - 1)"
          class="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <button
          :disabled="meta.page >= totalPages"
          @click="goto(meta.page + 1)"
          class="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <CategoryForm
      v-if="showForm"
      :initial="editRow"
      :divisions="divisions"
      :parentOptions="parentOptions"
      @close="closeForm"
      @saved="onSaved"
    />

    <div v-if="error" class="mt-3 text-red-600">{{ error }}</div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/stores/categories'
import CategoryForm from './CategoryForm.vue'

const store = useCategoriesStore()
const { items, meta, loading, error, divisions, filters } = storeToRefs(store)

const showForm = ref(false)
const editRow = ref(null)

const totalPages = computed(() =>
  Math.max(1, Math.ceil((meta.value?.total || 0) / (meta.value?.limit || 1)))
)

// Parent options shown in filter dropdown should come from current list,
// but exclude deleted + exclude the row being edited (if any).
const parentOptions = computed(() =>
  (items.value || []).filter(c => !c.deleted_at && String(c.id) !== String(editRow.value?.id))
)

function divisionName(id) {
  const list = divisions.value || []
  return list.find(d => String(d.id) === String(id))?.name || `#${id}`
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString()
}

async function reload(extra = {}) {
  await store.fetchList({ page: 1, ...extra })
}

function openCreate() {
  editRow.value = null
  showForm.value = true
}
function openEdit(row) {
  editRow.value = row
  showForm.value = true
}
function closeForm() {
  showForm.value = false
}

async function onSaved() {
  showForm.value = false
  await reload()
}

async function confirmDelete(row) {
  if (confirm(`Delete "${row.name}" (and its subcategories)?`)) {
    await store.remove(row.id)
    await reload()
  }
}

async function confirmRestore(row) {
  if (!confirm(`Restore "${row.name}" (and its subcategories)?`)) return
  try {
    await store.restore(row.id)
    await reload()
  } catch (e) {
    // restore conflict (e.g., category with same name already active in same division)
    const msg = e?.response?.data?.error || e?.message || 'Failed to restore category'
    alert(msg)
  }
}

function goto(page) {
  const p = Math.min(Math.max(1, page), totalPages.value)
  store.fetchList({ page: p })
}

onMounted(async () => {
  await store.fetchDivisions()
  await store.fetchList()
})
</script>
