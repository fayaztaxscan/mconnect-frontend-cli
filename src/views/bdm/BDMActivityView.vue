<!-- src/views/bdm/BDMActivityView.vue -->
<template>
  <div class="min-h-screen bg-slate-50">
    <div class="max-w-6xl mx-auto p-4 sm:p-6">

      <!-- Header -->
      <div class="mb-5">
        <h1 class="text-xl sm:text-2xl font-bold">My Activity History</h1>
        <p class="text-sm text-gray-500 mt-1">All signup requests you have reviewed, with approval details and photo status.</p>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div class="bg-white rounded-lg border p-4 text-center">
          <div class="text-2xl font-bold text-indigo-600">{{ stats.total }}</div>
          <div class="text-xs text-gray-500 mt-1">Total Reviewed</div>
        </div>
        <div class="bg-white rounded-lg border p-4 text-center">
          <div class="text-2xl font-bold text-green-600">{{ stats.full_approvals }}</div>
          <div class="text-xs text-gray-500 mt-1">Full Approvals</div>
        </div>
        <div class="bg-white rounded-lg border p-4 text-center">
          <div class="text-2xl font-bold text-amber-600">{{ stats.temp_approvals }}</div>
          <div class="text-xs text-gray-500 mt-1">Temporary</div>
        </div>
        <div class="bg-white rounded-lg border p-4 text-center">
          <div class="text-2xl font-bold text-red-600">{{ stats.photo_pending }}</div>
          <div class="text-xs text-gray-500 mt-1">Photo Pending</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white border rounded-lg p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label class="block text-xs text-gray-500 mb-1">From</label>
          <input type="date" v-model="filters.from" class="border rounded px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">To</label>
          <input type="date" v-model="filters.to" class="border rounded px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">Approval Type</label>
          <select v-model="filters.approval_type" class="border rounded px-3 py-1.5 text-sm">
            <option value="">All</option>
            <option value="full">Full</option>
            <option value="temporary">Temporary</option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">Photo Status</label>
          <select v-model="filters.photo_status" class="border rounded px-3 py-1.5 text-sm">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <button
          type="button"
          @click="load(1)"
          class="px-4 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
        >Apply</button>
        <button
          type="button"
          @click="resetFilters"
          class="px-4 py-1.5 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
        >Reset</button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-16 text-gray-400">Loading...</div>

      <!-- Empty -->
      <div v-else-if="rows.length === 0" class="text-center py-16 text-gray-400">No records found.</div>

      <!-- Table -->
      <div v-else class="bg-white border rounded-lg overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 border-b text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th class="px-4 py-3 text-left">Applicant</th>
              <th class="px-4 py-3 text-left">Phone</th>
              <th class="px-4 py-3 text-left">Decision</th>
              <th class="px-4 py-3 text-left">Decision Date</th>
              <th class="px-4 py-3 text-left">Photo Deadline</th>
              <th class="px-4 py-3 text-left">Photo Status</th>
              <th class="px-4 py-3 text-left">How They Found Us</th>
              <th class="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="r in rows" :key="r.id" class="hover:bg-slate-50">
              <td class="px-4 py-3 font-medium">{{ r.user_name }}</td>
              <td class="px-4 py-3 text-gray-500">{{ r.user_phone || '-' }}</td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="decisionClass(r.bdm_approval_type)"
                >{{ decisionLabel(r.bdm_approval_type) }}</span>
              </td>
              <td class="px-4 py-3 text-gray-500">{{ fmtDate(r.bdm_approved_at) }}</td>
              <td class="px-4 py-3 text-gray-500">
                <span v-if="r.bdm_photo_due_date">
                  {{ fmtDate(r.bdm_photo_due_date) }}
                  <span v-if="isOverdue(r.bdm_photo_due_date) && !r.bdm_photo_completed_at" class="ml-1 text-red-500 font-semibold">OVERDUE</span>
                </span>
                <span v-else>-</span>
              </td>
              <td class="px-4 py-3">
                <span v-if="r.bdm_approval_type !== 'temporary'">-</span>
                <span
                  v-else
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="r.bdm_photo_completed_at ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'"
                >{{ r.bdm_photo_completed_at ? 'Submitted' : 'Pending' }}</span>
              </td>
              <td class="px-4 py-3 text-gray-500 text-xs">
                <div v-if="r.utm_source">{{ utmLabel(r.utm_source) }}</div>
                <div v-if="r.utm_medium" class="text-gray-400">via {{ r.utm_medium }}</div>
                <div v-if="r.utm_campaign" class="text-gray-400">{{ r.utm_campaign }}</div>
                <span v-if="!r.utm_source">-</span>
              </td>
              <td class="px-4 py-3">
                <button
                  v-if="r.bdm_approval_type === 'temporary' && !r.bdm_photo_completed_at"
                  type="button"
                  @click="openPhotoModal(r)"
                  class="px-3 py-1 bg-amber-600 text-white rounded text-xs hover:bg-amber-700"
                >Upload Photo</button>
                <span v-else class="text-gray-300 text-xs">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between mt-4 text-sm text-gray-600">
        <span>Page {{ page }} of {{ totalPages }} ({{ total }} records)</span>
        <div class="flex gap-2">
          <button
            type="button"
            :disabled="page <= 1"
            @click="load(page - 1)"
            class="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
          >Prev</button>
          <button
            type="button"
            :disabled="page >= totalPages"
            @click="load(page + 1)"
            class="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
          >Next</button>
        </div>
      </div>

    </div>
  </div>

  <!-- Upload Photo Modal -->
  <div v-if="photoModal.open" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl w-full max-w-md shadow-2xl">
      <div class="px-6 py-4 border-b flex items-center justify-between">
        <h2 class="font-bold text-lg">Upload Verification Photo</h2>
        <button type="button" @click="photoModal.open = false" class="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
      </div>
      <div class="px-6 py-5 space-y-4">
        <p class="text-sm text-gray-600">
          Applicant: <span class="font-medium">{{ photoModal.row?.user_name }}</span>
          <br>
          Deadline: <span :class="isOverdue(photoModal.row?.bdm_photo_due_date) ? 'text-red-600 font-semibold' : 'text-gray-700'">
            {{ fmtDate(photoModal.row?.bdm_photo_due_date) }}
          </span>
        </p>

        <div>
          <label class="block text-sm font-medium mb-1">Verification Photo</label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            @change="photoModal.file = $event.target.files[0]"
            class="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>

        <div v-if="photoModal.progress > 0 && photoModal.progress < 100" class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-indigo-600 h-2 rounded-full transition-all" :style="{ width: photoModal.progress + '%' }"></div>
        </div>

        <div v-if="photoModal.error" class="text-red-600 text-sm">{{ photoModal.error }}</div>
      </div>
      <div class="px-6 py-4 border-t flex justify-end gap-3">
        <button type="button" @click="photoModal.open = false" class="px-4 py-2 border rounded text-sm hover:bg-gray-50">Cancel</button>
        <button
          type="button"
          :disabled="!photoModal.file || photoModal.uploading"
          @click="submitPhoto"
          class="px-4 py-2 rounded text-sm text-white font-medium transition"
          :class="(!photoModal.file || photoModal.uploading) ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'"
        >
          <span v-if="!photoModal.uploading">Submit Photo</span>
          <span v-else>Uploading...</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/services/api'

const UTM_LABELS = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  google: 'Google',
  referral: 'Referral',
  organic: 'Organic / Direct',
  email: 'Email Campaign',
  sms: 'SMS Campaign',
}

const loading = ref(false)
const rows = ref([])
const total = ref(0)
const page = ref(1)
const perPage = 20

const stats = reactive({ total: 0, full_approvals: 0, temp_approvals: 0, photo_pending: 0 })

const filters = reactive({ from: '', to: '', approval_type: '', photo_status: '' })

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage)))

async function load(p = 1) {
  loading.value = true
  page.value = p
  try {
    const params = { page: p, per_page: perPage, ...filters }
    const { data } = await api.get('/retail-signup/bdm/activity', { params })
    rows.value = data.rows || []
    total.value = data.total || 0
    if (data.stats) Object.assign(stats, data.stats)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  filters.from = ''
  filters.to = ''
  filters.approval_type = ''
  filters.photo_status = ''
  load(1)
}

function fmtDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function isOverdue(d) {
  if (!d) return false
  return new Date(d) < new Date()
}

function decisionLabel(t) {
  if (t === 'full') return 'Full Approval'
  if (t === 'temporary') return 'Temporary'
  if (t === 'rejected') return 'Rejected'
  return t || '-'
}

function decisionClass(t) {
  if (t === 'full') return 'bg-green-100 text-green-700'
  if (t === 'temporary') return 'bg-amber-100 text-amber-700'
  if (t === 'rejected') return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-600'
}

function utmLabel(src) {
  return UTM_LABELS[src?.toLowerCase()] || src || '-'
}

// Photo modal
const photoModal = reactive({
  open: false,
  row: null,
  file: null,
  uploading: false,
  progress: 0,
  error: '',
})

function openPhotoModal(r) {
  Object.assign(photoModal, { open: true, row: r, file: null, uploading: false, progress: 0, error: '' })
}

async function submitPhoto() {
  if (!photoModal.file) return
  photoModal.uploading = true
  photoModal.error = ''
  const fd = new FormData()
  fd.append('photo', photoModal.file)
  try {
    await api.post(`/retail-signup/${photoModal.row.id}/bdm-photo`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: e => { photoModal.progress = Math.round((e.loaded / e.total) * 100) }
    })
    photoModal.open = false
    load(page.value)
  } catch (e) {
    photoModal.error = e.response?.data?.error || e.message || 'Upload failed'
  } finally {
    photoModal.uploading = false
  }
}

onMounted(() => load(1))
</script>
