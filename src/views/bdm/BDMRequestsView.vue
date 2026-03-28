<!-- src/views/bdm/BDMRequestsView.vue -->
<template>
  <div class="min-h-screen bg-slate-50">
    <div class="max-w-5xl mx-auto p-4 sm:p-6">

      <!-- Header -->
      <div class="mb-5">
        <h1 class="text-xl sm:text-2xl font-bold">BDM Approval Queue</h1>
        <p class="text-sm text-gray-500 mt-1">
          Review and approve retail staff signup requests verified by CSR.
          Full approval requires a verification photo. Temporary approval allowed
          with a committed photo deadline (max 45 days).
        </p>
      </div>

      <!-- Tabs + Refresh -->
      <div class="flex flex-wrap items-center gap-2 mb-4">
        <!-- Pending tab -->
        <button
          type="button"
          class="px-4 py-2 rounded text-sm font-medium transition"
          :class="activeTab === 'pending'
            ? 'bg-indigo-600 text-white'
            : 'bg-white border text-gray-700 hover:bg-gray-50'"
          @click="switchTab('pending')"
        >
          Pending
          <span class="ml-1 text-xs font-semibold">({{ counts.pending }})</span>
        </button>

        <!-- Overdue tab — always shows count badge for visibility -->
        <button
          type="button"
          class="px-4 py-2 rounded text-sm font-medium transition relative"
          :class="activeTab === 'overdue'
            ? 'bg-red-600 text-white'
            : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'"
          @click="switchTab('overdue')"
        >
          Overdue
          <span
            class="ml-1 text-xs font-semibold px-1.5 py-0.5 rounded-full"
            :class="activeTab === 'overdue' ? 'bg-red-800 text-white' : 'bg-red-200 text-red-800'"
          >{{ counts.overdue }}</span>
        </button>

        <!-- Photo Pending tab -->
        <button
          type="button"
          class="px-4 py-2 rounded text-sm font-medium transition"
          :class="activeTab === 'photo_pending'
            ? 'bg-amber-500 text-white'
            : 'bg-white border text-gray-700 hover:bg-gray-50'"
          @click="switchTab('photo_pending')"
        >
          Photo Pending
          <span class="ml-1 text-xs font-semibold">({{ counts.photo_pending }})</span>
        </button>

        <div class="ml-auto">
          <button
            type="button"
            class="px-3 py-2 rounded bg-white border text-sm hover:bg-gray-50"
            :disabled="loading"
            @click="fetchRequests(activeTab)"
          >
            {{ loading ? 'Refreshing…' : 'Refresh' }}
          </button>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
        {{ error }}
      </div>

      <!-- Loading -->
      <div v-if="loading" class="py-10 text-center text-gray-500 text-sm">Loading…</div>

      <!-- Card list -->
      <div v-else class="space-y-3">
        <div v-if="requests.length === 0" class="bg-white rounded-lg border p-6 text-center text-gray-500 text-sm">
          <span v-if="activeTab === 'pending'">No pending approvals 🎉</span>
          <span v-else-if="activeTab === 'overdue'">No overdue requests 🎉</span>
          <span v-else>No photo submissions pending 🎉</span>
        </div>

        <div
          v-for="r in requests"
          :key="r.id"
          class="bg-white rounded-lg border shadow-sm p-4"
        >
          <!-- Row 1: badges -->
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <span class="font-semibold text-gray-900">{{ r.user_name }}</span>
            <span class="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">{{ r.country_code }}</span>
            <span v-if="r.region_id" class="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
              Region #{{ r.region_id }}
            </span>
            <span class="text-xs text-gray-400">#{{ r.id }}</span>
            <span
              v-if="activeTab === 'overdue'"
              class="text-xs px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-medium"
            >
              ⚠️ OVERDUE
            </span>
            <span
              v-if="r.bdm_approval_type"
              class="text-xs px-2 py-0.5 rounded border"
              :class="r.bdm_approval_type === 'temporary'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-green-50 text-green-700 border-green-200'"
            >
              {{ r.bdm_approval_type === 'temporary' ? '⏱ Temporary' : '✅ Full' }}
            </span>
          </div>

          <!-- Row 2: contact -->
          <div class="text-sm text-gray-600 mb-1">
            <span class="text-gray-500">Phone:</span> {{ r.contact_phone || '—' }}
            <span class="mx-2 text-gray-300">|</span>
            <span class="text-gray-500">WhatsApp:</span> {{ r.whatsapp_phone || '—' }}
          </div>

          <!-- Row 3: applicant's words -->
          <div class="text-sm text-gray-600 mb-1">
            <span class="text-gray-500">Applicant's own words:</span>
            Shop: {{ r.shop_name || '—' }}
            <span class="mx-2 text-gray-300">|</span>
            Location: {{ r.location || '—' }}
          </div>

          <!-- Row 4: assigned shop -->
          <div v-if="r.shop_id || r.dealer_id || r.brand_id" class="text-sm text-gray-600 mb-1 flex flex-wrap items-center gap-1">
            <span class="text-gray-500">Assigned to:</span>
            <span class="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
              {{ r.shop_name_mapped || ('Shop #' + r.shop_id) }}
            </span>
            <span v-if="r.dealer_id" class="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Dealer #{{ r.dealer_id }}
            </span>
            <span v-if="r.brand_id" class="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Brand #{{ r.brand_id }}
            </span>
          </div>

          <!-- Row 5: CSR notes -->
          <div v-if="r.csr_notes" class="text-sm text-gray-500 mb-1">
            <span class="text-gray-400">CSR Notes:</span> {{ r.csr_notes }}
          </div>

          <!-- Row 6: dates -->
          <div class="text-xs text-gray-500 mb-3 flex flex-wrap gap-3">
            <span v-if="r.csr_verified_at">
              CSR Verified: {{ fmtDate(r.csr_verified_at) }}
            </span>
            <span v-if="r.bdm_due_at" :class="isOverdue(r.bdm_due_at) ? 'text-red-600 font-medium' : ''">
              BDM Due: {{ fmtDate(r.bdm_due_at) }}
            </span>
          </div>

          <!-- Action buttons: pending + overdue tabs -->
          <div v-if="activeTab !== 'photo_pending'" class="flex flex-wrap gap-2">
            <button
              type="button"
              class="px-3 py-2 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              :disabled="actionId === r.id"
              @click="openApprove(r)"
            >
              ✅ Approve
            </button>
            <button
              type="button"
              class="px-3 py-2 rounded bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50"
              :disabled="actionId === r.id"
              @click="openTempApprove(r)"
            >
              ⏱ Temporary Approval
            </button>
            <button
              type="button"
              class="px-3 py-2 rounded border border-red-300 text-red-700 text-sm font-medium hover:bg-red-50 disabled:opacity-50"
              :disabled="actionId === r.id"
              @click="openReject(r)"
            >
              ✕ Reject
            </button>
          </div>

          <!-- Photo pending tab actions -->
          <div v-else>
            <div class="text-sm text-amber-700 mb-1">⏱ Temporary approval granted</div>
            <div class="text-sm mb-3" :class="isOverdue(r.bdm_photo_due_date) ? 'text-red-600 font-medium' : 'text-gray-600'">
              Photo due by: {{ r.bdm_photo_due_date || '—' }}
              <span v-if="isOverdue(r.bdm_photo_due_date)" class="ml-1">⚠️ Overdue</span>
            </div>
            <button
              type="button"
              class="px-3 py-2 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              :disabled="actionId === r.id"
              @click="openPhotoUpload(r)"
            >
              📷 Upload Verification Photo
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- FULL APPROVAL MODAL                           -->
    <!-- ═══════════════════════════════════════════════ -->
    <div v-if="approveModal.open" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-lg p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-start justify-between">
          <div>
            <div class="text-lg font-semibold">Full Approval</div>
            <div class="text-sm text-gray-500">{{ approveModal.request?.user_name }} — {{ approveModal.request?.contact_phone }}</div>
          </div>
          <button class="text-gray-400 hover:text-gray-700 text-lg" @click="closeApprove">✕</button>
        </div>

        <!-- Applicant info -->
        <div class="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
          Applicant's shop: <strong>{{ approveModal.request?.shop_name }}</strong>, {{ approveModal.request?.location }}
        </div>

        <!-- Photo upload -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Verification Photo</label>
          <p class="text-xs text-gray-500 mb-2">
            Take or upload a photo of the shop as proof of your physical visit.
            Accepted: JPG, PNG, WebP up to 5MB.
          </p>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            class="block w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            @change="onApprovePhotoChange"
          />
          <div v-if="approveModal.previewUrl" class="mt-2">
            <img :src="approveModal.previewUrl" class="h-32 rounded border object-cover" alt="Preview" />
          </div>
          <!-- Progress bar -->
          <div v-if="approveModal.uploading" class="mt-2">
            <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Uploading…</span>
              <span>{{ approveModal.progress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-1.5">
              <div
                class="bg-green-500 h-1.5 rounded-full transition-all"
                :style="{ width: approveModal.progress + '%' }"
              />
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Approval Notes (optional)</label>
          <textarea
            v-model="approveModal.notes"
            rows="2"
            class="w-full border rounded px-3 py-2 text-sm"
            placeholder="Any notes about your visit…"
          />
        </div>

        <!-- Confirmation checkbox -->
        <label class="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" v-model="approveModal.confirmed" class="mt-0.5 h-4 w-4 rounded" />
          <span class="text-sm text-gray-700">
            I confirm I have physically visited this shop and verified the staff member's identity
          </span>
        </label>

        <!-- Error -->
        <div v-if="approveModal.error" class="text-sm text-red-600">{{ approveModal.error }}</div>

        <!-- Buttons -->
        <div class="flex items-center justify-end gap-2">
          <button class="px-3 py-2 rounded border text-sm hover:bg-gray-50" @click="closeApprove">Cancel</button>
          <button
            class="px-4 py-2 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            :disabled="!approveModal.confirmed || approveModal.uploading"
            @click="submitApprove"
          >
            {{ approveModal.uploading ? 'Submitting…' : '✅ Confirm Full Approval' }}
          </button>
        </div>

        <p class="text-xs text-gray-400 text-center">
          A verification photo is recommended but can be submitted later if needed.
        </p>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- TEMPORARY APPROVAL MODAL                       -->
    <!-- ═══════════════════════════════════════════════ -->
    <div v-if="tempModal.open" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-lg p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-start justify-between">
          <div>
            <div class="text-lg font-semibold">Temporary Approval</div>
            <div class="text-sm text-gray-500">{{ tempModal.request?.user_name }} — {{ tempModal.request?.contact_phone }}</div>
          </div>
          <button class="text-gray-400 hover:text-gray-700 text-lg" @click="closeTempApprove">✕</button>
        </div>

        <!-- Amber warning -->
        <div class="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-800">
          ⚠️ Temporary approval creates the user account immediately, but you must upload a verification
          photo within your committed deadline. Maximum allowed: 45 days from today.
        </div>

        <!-- Applicant info -->
        <div class="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
          Applicant's shop: <strong>{{ tempModal.request?.shop_name }}</strong>, {{ tempModal.request?.location }}
        </div>

        <!-- Date picker -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">I will upload verification photo by: *</label>
          <input
            v-model="tempModal.dueDate"
            type="date"
            :min="minDate"
            :max="maxDate"
            class="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <!-- Reason -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Reason for not visiting today: *</label>
          <textarea
            v-model="tempModal.reason"
            rows="3"
            class="w-full border rounded px-3 py-2 text-sm"
            placeholder="e.g. Shop is in a remote area, will visit next week during field trip…"
          />
        </div>

        <!-- Commit checkbox -->
        <label class="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" v-model="tempModal.committed" class="mt-0.5 h-4 w-4 rounded" />
          <span class="text-sm text-gray-700">
            I commit to uploading a verification photo by the selected date
          </span>
        </label>

        <!-- Error -->
        <div v-if="tempModal.error" class="text-sm text-red-600">{{ tempModal.error }}</div>

        <!-- Buttons -->
        <div class="flex items-center justify-end gap-2">
          <button class="px-3 py-2 rounded border text-sm hover:bg-gray-50" @click="closeTempApprove">Cancel</button>
          <button
            class="px-4 py-2 rounded bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50"
            :disabled="!tempModal.dueDate || !tempModal.reason.trim() || !tempModal.committed || tempModal.loading"
            @click="submitTempApprove"
          >
            {{ tempModal.loading ? 'Submitting…' : '⏱ Grant Temporary Approval' }}
          </button>
        </div>

        <p class="text-xs text-gray-400 text-center">
          The user account will be created immediately. You will receive a reminder notification.
        </p>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- REJECT MODAL                                    -->
    <!-- ═══════════════════════════════════════════════ -->
    <div v-if="rejectModal.open" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-5 space-y-4">
        <div class="flex items-start justify-between">
          <div>
            <div class="text-lg font-semibold">Reject Request</div>
            <div class="text-sm text-gray-500">{{ rejectModal.request?.user_name }} — {{ rejectModal.request?.contact_phone }}</div>
          </div>
          <button class="text-gray-400 hover:text-gray-700 text-lg" @click="closeReject">✕</button>
        </div>

        <!-- Red warning -->
        <div class="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
          ⚠️ Rejecting will permanently close this request. The applicant will need to re-apply.
        </div>

        <!-- Reason -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Reason for rejection: *</label>
          <textarea
            v-model="rejectModal.reason"
            rows="3"
            class="w-full border rounded px-3 py-2 text-sm"
            placeholder="e.g. Could not verify shop existence, duplicate application…"
          />
        </div>

        <!-- Error -->
        <div v-if="rejectModal.error" class="text-sm text-red-600">{{ rejectModal.error }}</div>

        <!-- Buttons -->
        <div class="flex items-center justify-end gap-2">
          <button class="px-3 py-2 rounded border text-sm hover:bg-gray-50" @click="closeReject">Cancel</button>
          <button
            class="px-4 py-2 rounded bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            :disabled="!rejectModal.reason.trim() || rejectModal.loading"
            @click="submitReject"
          >
            {{ rejectModal.loading ? 'Rejecting…' : '✕ Confirm Rejection' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- UPLOAD PHOTO MODAL (Photo Pending tab)          -->
    <!-- ═══════════════════════════════════════════════ -->
    <div v-if="photoModal.open" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-lg p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-start justify-between">
          <div>
            <div class="text-lg font-semibold">Upload Verification Photo</div>
            <div class="text-sm text-gray-500">{{ photoModal.request?.user_name }} — {{ photoModal.request?.contact_phone }}</div>
          </div>
          <button class="text-gray-400 hover:text-gray-700 text-lg" @click="closePhotoUpload">✕</button>
        </div>

        <!-- Info / deadline -->
        <div
          class="border rounded p-3 text-sm"
          :class="isOverdue(photoModal.request?.bdm_photo_due_date)
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-blue-50 border-blue-200 text-blue-800'"
        >
          Temporary approval was granted.
          Photo due by: <strong>{{ photoModal.request?.bdm_photo_due_date || '—' }}</strong>
          <span v-if="isOverdue(photoModal.request?.bdm_photo_due_date)" class="block mt-1 font-semibold">
            ⚠️ DEADLINE PASSED
          </span>
        </div>

        <!-- File input -->
        <div>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            class="block w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            @change="onPhotoModalChange"
          />
          <div v-if="photoModal.previewUrl" class="mt-2">
            <img :src="photoModal.previewUrl" class="h-32 rounded border object-cover" alt="Preview" />
          </div>
          <!-- Progress bar -->
          <div v-if="photoModal.uploading" class="mt-2">
            <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Uploading…</span>
              <span>{{ photoModal.progress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-1.5">
              <div
                class="bg-green-500 h-1.5 rounded-full transition-all"
                :style="{ width: photoModal.progress + '%' }"
              />
            </div>
          </div>
        </div>

        <!-- Confirm checkbox -->
        <label class="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" v-model="photoModal.confirmed" class="mt-0.5 h-4 w-4 rounded" />
          <span class="text-sm text-gray-700">
            I confirm this photo was taken at the applicant's shop
          </span>
        </label>

        <!-- Error -->
        <div v-if="photoModal.error" class="text-sm text-red-600">{{ photoModal.error }}</div>

        <!-- Buttons -->
        <div class="flex items-center justify-end gap-2">
          <button class="px-3 py-2 rounded border text-sm hover:bg-gray-50" @click="closePhotoUpload">Cancel</button>
          <button
            class="px-4 py-2 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            :disabled="!photoModal.file || !photoModal.confirmed || photoModal.uploading"
            @click="submitPhoto"
          >
            {{ photoModal.uploading ? 'Uploading…' : '📷 Submit Verification Photo' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

// ─────────────────────────────────────────
// State
// ─────────────────────────────────────────
const loading   = ref(false)
const error     = ref('')
const requests  = ref([])
const counts    = ref({ pending: 0, overdue: 0, photo_pending: 0 })
const activeTab = ref('pending')
const actionId  = ref(null)

// ─────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────
function fmtDate(v) {
  if (!v) return '—'
  try { return new Date(v).toLocaleString() } catch { return String(v) }
}

function isOverdue(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

// min = tomorrow, max = today + 45 days (YYYY-MM-DD strings)
const minDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
})
const maxDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 45)
  return d.toISOString().slice(0, 10)
})

// ─────────────────────────────────────────
// Data fetching
// ─────────────────────────────────────────
async function fetchRequests(tab) {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/retail-signup/bdm/requests', { params: { tab } })
    const body = res.data
    requests.value = body?.data ?? []
    if (body?.counts) counts.value = body.counts
  } catch (e) {
    error.value = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load queue'
  } finally {
    loading.value = false
  }
}

function switchTab(tab) {
  activeTab.value = tab
  fetchRequests(tab)
}

// ─────────────────────────────────────────
// Full Approval modal
// ─────────────────────────────────────────
const approveModal = ref({
  open: false,
  request: null,
  file: null,
  previewUrl: null,
  notes: '',
  confirmed: false,
  uploading: false,
  progress: 0,
  error: ''
})

function openApprove(r) {
  approveModal.value = {
    open: true, request: r,
    file: null, previewUrl: null,
    notes: '', confirmed: false,
    uploading: false, progress: 0, error: ''
  }
}
function closeApprove() {
  approveModal.value.open = false
}
function onApprovePhotoChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  approveModal.value.file = file
  approveModal.value.previewUrl = URL.createObjectURL(file)
}
async function submitApprove() {
  const m = approveModal.value
  if (!m.confirmed) return
  m.error = ''
  m.uploading = true
  m.progress = 0

  try {
    const fd = new FormData()
    fd.append('approval_type', 'full')
    if (m.notes.trim()) fd.append('notes', m.notes.trim())
    if (m.file) fd.append('photo', m.file)

    await api.post(`/retail-signup/requests/${m.request.id}/bdm-approve`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
      onUploadProgress: (e) => {
        m.progress = Math.round((e.loaded * 100) / e.total)
      }
    })
    closeApprove()
    await fetchRequests(activeTab.value)
  } catch (e) {
    m.error = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Approval failed'
  } finally {
    m.uploading = false
  }
}

// ─────────────────────────────────────────
// Temporary Approval modal
// ─────────────────────────────────────────
const tempModal = ref({
  open: false,
  request: null,
  dueDate: '',
  reason: '',
  committed: false,
  loading: false,
  error: ''
})

function openTempApprove(r) {
  tempModal.value = {
    open: true, request: r,
    dueDate: '', reason: '',
    committed: false, loading: false, error: ''
  }
}
function closeTempApprove() {
  tempModal.value.open = false
}
async function submitTempApprove() {
  const m = tempModal.value
  if (!m.dueDate || !m.reason.trim() || !m.committed) return
  m.error = ''
  m.loading = true
  try {
    await api.post(`/retail-signup/requests/${m.request.id}/bdm-approve`, {
      approval_type: 'temporary',
      bdm_photo_due_date: m.dueDate,
      bdm_temp_reason: m.reason.trim()
    })
    closeTempApprove()
    await fetchRequests(activeTab.value)
  } catch (e) {
    m.error = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Temporary approval failed'
  } finally {
    m.loading = false
  }
}

// ─────────────────────────────────────────
// Reject modal
// ─────────────────────────────────────────
const rejectModal = ref({
  open: false,
  request: null,
  reason: '',
  loading: false,
  error: ''
})

function openReject(r) {
  rejectModal.value = { open: true, request: r, reason: '', loading: false, error: '' }
}
function closeReject() {
  rejectModal.value.open = false
}
async function submitReject() {
  const m = rejectModal.value
  if (!m.reason.trim()) return
  m.error = ''
  m.loading = true
  try {
    await api.post(`/retail-signup/requests/${m.request.id}/bdm-reject`, { reason: m.reason.trim() })
    closeReject()
    await fetchRequests(activeTab.value)
  } catch (e) {
    m.error = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Rejection failed'
  } finally {
    m.loading = false
  }
}

// ─────────────────────────────────────────
// Photo upload modal (Photo Pending tab)
// ─────────────────────────────────────────
const photoModal = ref({
  open: false,
  request: null,
  file: null,
  previewUrl: null,
  confirmed: false,
  uploading: false,
  progress: 0,
  error: ''
})

function openPhotoUpload(r) {
  photoModal.value = {
    open: true, request: r,
    file: null, previewUrl: null,
    confirmed: false,
    uploading: false, progress: 0, error: ''
  }
}
function closePhotoUpload() {
  photoModal.value.open = false
}
function onPhotoModalChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  photoModal.value.file = file
  photoModal.value.previewUrl = URL.createObjectURL(file)
}
async function submitPhoto() {
  const m = photoModal.value
  if (!m.file || !m.confirmed) return
  m.error = ''
  m.uploading = true
  m.progress = 0
  try {
    const fd = new FormData()
    fd.append('photo', m.file)

    await api.post(`/retail-signup/requests/${m.request.id}/bdm-photo`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
      onUploadProgress: (e) => {
        m.progress = Math.round((e.loaded * 100) / e.total)
      }
    })
    closePhotoUpload()
    await fetchRequests(activeTab.value)
  } catch (e) {
    m.error = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Photo upload failed'
  } finally {
    m.uploading = false
  }
}

// ─────────────────────────────────────────
// Init
// ─────────────────────────────────────────
onMounted(() => fetchRequests('pending'))
</script>
