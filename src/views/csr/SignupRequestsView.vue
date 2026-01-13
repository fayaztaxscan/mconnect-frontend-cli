<!-- src/views/csr/SignupRequestsView.vue -->
<template>
  <div class="min-h-screen bg-slate-50">
    <div class="max-w-6xl mx-auto p-4 sm:p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold">Retail Staff Signup Requests</h1>
          <p class="text-sm text-gray-500">Review and approve/reject pending requests.</p>
        </div>

        <div class="flex items-center gap-2">
          <select
            v-model="status"
            class="border rounded px-3 py-2 text-sm bg-white"
            @change="fetchRequests"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="duplicate">Duplicate</option>
          </select>

          <button
            type="button"
            class="px-3 py-2 rounded bg-white border text-sm hover:bg-gray-50"
            @click="fetchRequests"
            :disabled="loading"
          >
            {{ loading ? 'Refreshing…' : 'Refresh' }}
          </button>
        </div>
      </div>

      <div v-if="error" class="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
        {{ error }}
      </div>

      <div v-if="loading" class="p-6 text-center text-gray-500">
        Loading…
      </div>

      <div v-else class="bg-white rounded-lg shadow border">
        <div v-if="requests.length === 0" class="p-6 text-gray-500">
          No requests found for "{{ status }}".
        </div>

        <div v-else class="divide-y">
          <div
            v-for="r in requests"
            :key="r.id"
            class="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <div class="font-semibold text-gray-900">{{ r.user_name }}</div>
                <span class="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {{ r.country_code }}
                </span>
                <span class="text-xs text-gray-500">#{{ r.id }}</span>
              </div>

              <div class="text-sm text-gray-600 mt-1 space-y-0.5">
                <div>
                  <span class="text-gray-500">Phone:</span> {{ r.contact_phone }}
                  <span class="mx-2 text-gray-300">|</span>
                  <span class="text-gray-500">WhatsApp:</span> {{ r.whatsapp_phone }}
                </div>
                <div>
                  <span class="text-gray-500">Shop:</span> {{ r.shop_name }}
                  <span class="mx-2 text-gray-300">|</span>
                  <span class="text-gray-500">Location:</span> {{ r.location }}
                </div>
                <div v-if="r.email">
                  <span class="text-gray-500">Email:</span> {{ r.email }}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 justify-end">
              <button
                v-if="status === 'pending'"
                type="button"
                class="px-3 py-2 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                @click="openApprove(r)"
              >
                Approve
              </button>

              <button
                v-if="status === 'pending'"
                type="button"
                class="px-3 py-2 rounded bg-white border text-sm hover:bg-gray-50"
                @click="openReject(r)"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- APPROVE MODAL -->
      <div v-if="approveOpen" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow max-w-lg w-full p-4 space-y-4">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-lg font-semibold">Approve Request</div>
              <div class="text-sm text-gray-500">
                {{ selected?.user_name }} — {{ selected?.contact_phone }}
              </div>
            </div>
            <button class="text-gray-500 hover:text-gray-800" @click="closeApprove">✕</button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-600 mb-1">Brand ID</label>
              <input v-model.number="approveForm.brand_id" type="number" class="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Division ID</label>
              <input v-model.number="approveForm.division_id" type="number" class="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Dealer ID (optional)</label>
              <input v-model.number="approveForm.dealer_id" type="number" class="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Shop ID (optional)</label>
              <input v-model.number="approveForm.shop_id" type="number" class="w-full border rounded px-3 py-2" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs text-gray-600 mb-1">Shop Name (optional)</label>
              <input v-model="approveForm.shop_name" type="text" class="w-full border rounded px-3 py-2" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs text-gray-600 mb-1">Location (optional)</label>
              <input v-model="approveForm.location" type="text" class="w-full border rounded px-3 py-2" />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2">
            <button class="px-3 py-2 rounded bg-white border hover:bg-gray-50" @click="closeApprove">
              Cancel
            </button>
            <button
              class="px-3 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
              :disabled="approveLoading"
              @click="submitApprove"
            >
              {{ approveLoading ? 'Approving…' : 'Approve' }}
            </button>
          </div>

          <div v-if="approveError" class="text-sm text-red-600">
            {{ approveError }}
          </div>
        </div>
      </div>

      <!-- REJECT MODAL -->
      <div v-if="rejectOpen" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow max-w-lg w-full p-4 space-y-4">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-lg font-semibold">Reject Request</div>
              <div class="text-sm text-gray-500">
                {{ selected?.user_name }} — {{ selected?.contact_phone }}
              </div>
            </div>
            <button class="text-gray-500 hover:text-gray-800" @click="closeReject">✕</button>
          </div>

          <div>
            <label class="block text-xs text-gray-600 mb-1">Reason</label>
            <textarea
              v-model="rejectReason"
              rows="3"
              class="w-full border rounded px-3 py-2"
              placeholder="Reason for rejection…"
            />
          </div>

          <div class="flex items-center justify-end gap-2">
            <button class="px-3 py-2 rounded bg-white border hover:bg-gray-50" @click="closeReject">
              Cancel
            </button>
            <button
              class="px-3 py-2 rounded bg-rose-600 text-white hover:bg-rose-700"
              :disabled="rejectLoading"
              @click="submitReject"
            >
              {{ rejectLoading ? 'Rejecting…' : 'Reject' }}
            </button>
          </div>

          <div v-if="rejectError" class="text-sm text-red-600">
            {{ rejectError }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '@/services/api'

const status = ref('pending')
const loading = ref(false)
const error = ref('')
const requests = ref([])

const selected = ref(null)

const approveOpen = ref(false)
const approveLoading = ref(false)
const approveError = ref('')
const approveForm = ref({
  brand_id: null,
  division_id: null,
  dealer_id: null,
  shop_id: null,
  shop_name: '',
  location: ''
})

const rejectOpen = ref(false)
const rejectLoading = ref(false)
const rejectError = ref('')
const rejectReason = ref('')

async function fetchRequests() {
  loading.value = true
  error.value = ''
  try {
    // backend route: GET /api/retail-signup/requests?status=pending
    const res = await api.get('/retail-signup/requests', { params: { status: status.value } })
    // controller may return {success:true, data:[...]} or raw list
    const data = res.data?.data ?? res.data
    requests.value = Array.isArray(data) ? data : []
  } catch (e) {
    error.value = e?.response?.data?.message || e?.response?.data?.error || e.message || 'Failed to load requests'
  } finally {
    loading.value = false
  }
}

function openApprove(r) {
  selected.value = r
  approveError.value = ''
  approveForm.value = {
    brand_id: null,
    division_id: null,
    dealer_id: null,
    shop_id: null,
    shop_name: r?.shop_name || '',
    location: r?.location || ''
  }
  approveOpen.value = true
}
function closeApprove() {
  approveOpen.value = false
  selected.value = null
}

async function submitApprove() {
  approveError.value = ''
  if (!selected.value?.id) return

  // minimal validation (backend will also validate)
  if (!approveForm.value.brand_id || !approveForm.value.division_id) {
    approveError.value = 'brand_id and division_id are required'
    return
  }

  approveLoading.value = true
  try {
    await api.post(`/retail-signup/requests/${selected.value.id}/approve`, approveForm.value)
    approveOpen.value = false
    await fetchRequests()
  } catch (e) {
    approveError.value = e?.response?.data?.message || e?.response?.data?.error || e.message || 'Approve failed'
  } finally {
    approveLoading.value = false
  }
}

function openReject(r) {
  selected.value = r
  rejectReason.value = ''
  rejectError.value = ''
  rejectOpen.value = true
}
function closeReject() {
  rejectOpen.value = false
  selected.value = null
}

async function submitReject() {
  rejectError.value = ''
  if (!selected.value?.id) return
  if (!rejectReason.value.trim()) {
    rejectError.value = 'Reason is required'
    return
  }

  rejectLoading.value = true
  try {
    await api.post(`/retail-signup/requests/${selected.value.id}/reject`, { reason: rejectReason.value.trim() })
    rejectOpen.value = false
    await fetchRequests()
  } catch (e) {
    rejectError.value = e?.response?.data?.message || e?.response?.data?.error || e.message || 'Reject failed'
  } finally {
    rejectLoading.value = false
  }
}

onMounted(fetchRequests)
</script>
