<template>
  <div class="p-4 max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">BDM Approval Queue</h1>
      <button
        class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        @click="fetchQueue"
        :disabled="loading"
      >
        {{ loading ? 'Refreshing…' : 'Refresh' }}
      </button>
    </div>

    <div v-if="loading" class="text-center py-10">Loading…</div>
    <div v-else-if="error" class="text-red-600 bg-red-50 border border-red-200 p-3 rounded">
      {{ error }}
    </div>

    <div v-else class="bg-white border rounded shadow-sm overflow-x-auto">
      <table class="min-w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left px-4 py-3 border-b">ID</th>
            <th class="text-left px-4 py-3 border-b">Name</th>
            <th class="text-left px-4 py-3 border-b">Phone</th>
            <th class="text-left px-4 py-3 border-b">Shop</th>
            <th class="text-left px-4 py-3 border-b">CSR</th>
            <th class="text-left px-4 py-3 border-b">Verified At</th>
            <th class="text-left px-4 py-3 border-b">Due</th>
            <th class="text-left px-4 py-3 border-b">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="!items.length">
            <td colspan="8" class="px-4 py-6 text-center text-gray-500">
              No pending approvals 🎉
            </td>
          </tr>

          <tr v-for="r in items" :key="r.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 border-b">{{ r.id }}</td>
            <td class="px-4 py-3 border-b">{{ r.user_name }}</td>
            <td class="px-4 py-3 border-b">{{ r.contact_phone || '—' }}</td>
            <td class="px-4 py-3 border-b">
              <div class="font-medium">{{ r.shop_name || '—' }}</div>
              <div class="text-xs text-gray-500">{{ r.location || '' }}</div>
            </td>
            <td class="px-4 py-3 border-b">{{ r.csr_name || '—' }}</td>
            <td class="px-4 py-3 border-b">{{ fmt(r.csr_verified_at) }}</td>
            <td class="px-4 py-3 border-b">{{ fmt(r.bdm_due_at) }}</td>
            <td class="px-4 py-3 border-b">
              <div class="flex items-center gap-2">
                <button
                  class="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  @click="approve(r.id)"
                  :disabled="actionLoadingId === r.id"
                >
                  Approve
                </button>

                <button
                  class="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  @click="openReject(r.id)"
                  :disabled="actionLoadingId === r.id"
                >
                  Reject
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Reject Modal -->
    <div v-if="reject.open" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-lg shadow-lg p-5">
        <h2 class="text-lg font-semibold mb-2">Reject Request #{{ reject.id }}</h2>
        <p class="text-sm text-gray-600 mb-3">Please enter a reason (required).</p>

        <textarea
          v-model="reject.reason"
          rows="3"
          class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Reason…"
        />

        <div class="mt-4 flex justify-end gap-2">
          <button class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" @click="closeReject">
            Cancel
          </button>
          <button
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            :disabled="!reject.reason.trim() || actionLoadingId === reject.id"
            @click="rejectNow"
          >
            {{ actionLoadingId === reject.id ? 'Rejecting…' : 'Confirm Reject' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const loading = ref(false)
const error = ref('')
const items = ref([])

const actionLoadingId = ref(null)

const reject = ref({
  open: false,
  id: null,
  reason: ''
})

function fmt(ts) {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleString()
  } catch {
    return String(ts)
  }
}

async function fetchQueue() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/retail-signup/bdm/requests')
    // supports {success:true,data:[...]} or direct array
    items.value = res.data?.data ?? res.data ?? []
  } catch (e) {
    error.value = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load queue'
  } finally {
    loading.value = false
  }
}

async function approve(id) {
  if (!confirm(`Approve request #${id}?`)) return
  actionLoadingId.value = id
  try {
    await api.post(`/retail-signup/requests/${id}/bdm-approve`, {})
    await fetchQueue()
  } catch (e) {
    alert(e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Approve failed')
  } finally {
    actionLoadingId.value = null
  }
}

function openReject(id) {
  reject.value.open = true
  reject.value.id = id
  reject.value.reason = ''
}
function closeReject() {
  reject.value.open = false
  reject.value.id = null
  reject.value.reason = ''
}

async function rejectNow() {
  const id = reject.value.id
  const reason = reject.value.reason.trim()
  if (!id || !reason) return

  actionLoadingId.value = id
  try {
    await api.post(`/retail-signup/requests/${id}/bdm-reject`, { reason })
    closeReject()
    await fetchQueue()
  } catch (e) {
    alert(e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Reject failed')
  } finally {
    actionLoadingId.value = null
  }
}

onMounted(fetchQueue)
</script>

<style scoped>
/* Tailwind only */
</style>
