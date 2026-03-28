<!-- src/views/csr/SignupRequestsView.vue -->
<template>
  <div class="min-h-screen bg-slate-50">
    <div class="max-w-6xl mx-auto p-4 sm:p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold">Retail Staff Signup Requests</h1>
          <p class="text-sm text-gray-500">
            Review signup requests from retail staff. Approve by matching them to the correct shop, then BDM will complete the final approval.
          </p>
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
            <option value="all">All</option>
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

                <span v-if="r.region_id" class="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Region #{{ r.region_id }}
                </span>

                <span class="text-xs text-gray-500">#{{ r.id }}</span>

                <span
                  class="text-xs px-2 py-0.5 rounded border"
                  :class="badgeClass(r.status)"
                >
                  {{ r.status }}
                </span>

                <span
                  v-if="r.csr_verified_at"
                  class="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100"
                  title="CSR verified & shop mapped"
                >
                  CSR Verified
                </span>

                <span
                  v-if="r.bdm_due_at && r.csr_verified_at"
                  class="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-100"
                  title="BDM SLA due"
                >
                  BDM due: {{ fmtDateTime(r.bdm_due_at) }}
                </span>
              </div>

              <div class="text-sm text-gray-600 mt-2 space-y-1">
                <div>
                  <span class="text-gray-500">Phone:</span> {{ r.contact_phone }}
                  <span class="mx-2 text-gray-300">|</span>
                  <span class="text-gray-500">WhatsApp:</span> {{ r.whatsapp_phone }}
                </div>

                <div>
                  <span class="text-gray-500">Applicant's own words:</span> {{ r.shop_name }}
                  <span class="mx-2 text-gray-300">|</span>
                  <span class="text-gray-500">Location:</span> {{ r.location }}
                </div>

                <div v-if="r.email">
                  <span class="text-gray-500">Email:</span> {{ r.email }}
                </div>

                <!-- Assigned to (if already verified/mapped) -->
                <div v-if="r.shop_id || r.dealer_id || r.brand_id || r.division_id" class="pt-1">
                  <span class="text-gray-500">Assigned to:</span>
                  <span class="ml-2 inline-flex flex-wrap gap-1">
                    <span v-if="r.shop_id" class="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {{ r.shop_name_mapped || ('Shop #' + r.shop_id) }}
                    </span>
                    <span v-if="r.dealer_id" class="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Dealer #{{ r.dealer_id }}
                    </span>
                    <span v-if="r.brand_id" class="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Brand #{{ r.brand_id }}
                    </span>
                    <span v-if="r.division_id" class="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Division #{{ r.division_id }}
                    </span>
                  </span>
                </div>

                <div v-if="r.csr_notes" class="pt-1 text-xs text-gray-600">
                  <span class="text-gray-500">CSR Notes:</span> {{ r.csr_notes }}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 justify-end">
              <!-- Awaiting BDM badge for already-verified pending requests -->
              <span
                v-if="r.csr_verified_at && r.status === 'pending'"
                class="text-xs px-3 py-1.5 rounded bg-amber-50 text-amber-800 border border-amber-200"
              >
                ⏳ Awaiting BDM Approval
              </span>

              <!-- Approve / Reject buttons for unverified pending requests -->
              <template v-if="status === 'pending' && r.status === 'pending' && !r.csr_verified_at">
                <button
                  type="button"
                  class="px-3 py-2 rounded bg-green-600 text-white text-sm hover:bg-green-700"
                  @click="openMap(r)"
                >
                  Approve
                </button>

                <button
                  type="button"
                  class="px-3 py-2 rounded bg-white border text-sm hover:bg-gray-50"
                  @click="openReject(r)"
                >
                  Reject
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- APPROVE REQUEST MODAL -->
      <div v-if="mapOpen" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow max-w-xl w-full p-4 space-y-4">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-lg font-semibold">Approve Request</div>
              <div class="text-sm text-gray-500">
                {{ selected?.user_name }} — {{ selected?.contact_phone }}
              </div>
            </div>
            <button class="text-gray-500 hover:text-gray-800" @click="closeMap">✕</button>
          </div>

          <!-- Applicant info box -->
          <div class="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
            <div class="font-medium text-blue-800 mb-1">What the applicant entered:</div>
            <div class="text-blue-700">Shop name: {{ selected?.shop_name || '—' }}</div>
            <div class="text-blue-700">Location: {{ selected?.location || '—' }}</div>
          </div>

          <!-- Region at top -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="sm:col-span-2">
              <label class="block text-xs text-gray-600 mb-1">Region (from request)</label>
              <div class="px-3 py-2 border rounded bg-gray-50 text-sm">
                <span v-if="selected?.region_id">
                  Region #{{ selected.region_id }} ({{ selected?.country_code || '—' }})
                </span>
                <span v-else class="text-rose-600">
                  Region not available on this request. Please ensure request.region_id is saved.
                </span>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                Shops dropdown is filtered by this Region.
              </p>
            </div>

            <div class="sm:col-span-2">
              <label class="block text-xs text-gray-600 mb-1">Search Shop</label>
              <input
                v-model="shopSearch"
                type="text"
                class="w-full border rounded px-3 py-2"
                placeholder="Type shop name / code / location…"
                @input="debouncedFetchShops()"
                :disabled="!selected?.region_id"
              />
              <p class="text-xs text-amber-700 mt-1">
                The applicant may have spelled their shop name differently. Search and select the correct matching shop from the list.
              </p>
            </div>

            <div class="sm:col-span-2">
              <label class="block text-xs text-gray-600 mb-1">Match to correct Shop *</label>
              <select
                v-model.number="mapForm.shop_id"
                class="w-full border rounded px-3 py-2"
                :disabled="shopsLoading || !selected?.region_id"
              >
                <option disabled value="">
                  {{ !selected?.region_id ? 'Region missing in request' : (shopsLoading ? 'Loading shops…' : 'Select Shop') }}
                </option>
                <option v-for="s in shops" :key="s.id" :value="s.id">
                  {{ s.name }} — {{ s.shop_code }} — {{ s.location || '—' }}
                </option>
              </select>

              <div v-if="shops.length === 0 && !shopsLoading && selected?.region_id" class="text-xs text-amber-700 mt-1">
                No shops found for this region. Create/complete shops first (must have dealer/brand/division mapping).
              </div>

              <div v-if="selectedShop" class="mt-2 text-xs text-gray-700">
                <div class="flex flex-wrap gap-2">
                  <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    dealer: {{ selectedShop.dealer_name || ('#' + (selectedShop.dealer_id ?? '—')) }}
                  </span>
                  <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    brand: {{ selectedShop.brand_name || ('#' + (selectedShop.brand_id ?? '—')) }}
                  </span>
                  <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    division: {{ selectedShop.division_name || ('#' + (selectedShop.division_id ?? '—')) }}
                  </span>
                  <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    region: {{ selectedShop.region_name || ('#' + (selectedShop.region_id ?? '—')) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="sm:col-span-2">
              <label class="block text-xs text-gray-600 mb-1">CSR Notes (optional)</label>
              <textarea
                v-model="mapForm.notes"
                rows="3"
                class="w-full border rounded px-3 py-2"
                placeholder="Any verification notes…"
              />
            </div>
          </div>

          <!-- Physical verification checkbox -->
          <label class="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              v-model="physicallyVerified"
              class="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600"
            />
            <span class="text-sm text-gray-700">
              I confirm I have physically verified this shop and staff member
            </span>
          </label>

          <div class="flex items-center justify-end gap-2">
            <button class="px-3 py-2 rounded bg-white border hover:bg-gray-50" @click="closeMap">
              Cancel
            </button>
            <button
              class="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="mapLoading || !mapForm.shop_id || !selected?.region_id || !physicallyVerified"
              @click="submitMap"
            >
              {{ mapLoading ? 'Saving…' : 'Confirm Approval' }}
            </button>
          </div>

          <p class="text-xs text-gray-500 mt-2 text-center">
            After approval, this request will be sent to BDM for final review within 24 hours.
          </p>

          <div v-if="mapError" class="text-sm text-red-600">
            {{ mapError }}
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
import { onMounted, ref, computed } from 'vue'
import api from '@/services/api'

const status = ref('pending')
const loading = ref(false)
const error = ref('')
const requests = ref([])

const selected = ref(null)

// Map modal
const mapOpen = ref(false)
const mapLoading = ref(false)
const mapError = ref('')
const mapForm = ref({
  shop_id: '',
  notes: ''
})
const physicallyVerified = ref(false)

// Shops list filtered by region
const shops = ref([])
const shopsLoading = ref(false)
const shopSearch = ref('')

// Reject modal
const rejectOpen = ref(false)
const rejectLoading = ref(false)
const rejectError = ref('')
const rejectReason = ref('')

const selectedShop = computed(() => {
  const sid = Number(mapForm.value.shop_id)
  if (!sid) return null
  return shops.value.find(s => Number(s.id) === sid) || null
})

function badgeClass(st) {
  const v = String(st || '').toLowerCase()
  if (v === 'approved') return 'bg-emerald-50 text-emerald-700 border-emerald-100'
  if (v === 'rejected') return 'bg-rose-50 text-rose-700 border-rose-100'
  if (v === 'duplicate') return 'bg-amber-50 text-amber-800 border-amber-100'
  return 'bg-slate-50 text-slate-700 border-slate-200'
}

function fmtDateTime(v) {
  if (!v) return ''
  try {
    const d = new Date(v)
    // local display (no timezone assumptions)
    return d.toLocaleString()
  } catch {
    return String(v)
  }
}

async function fetchRequests() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/retail-signup/requests', { params: { status: status.value } })
    const data = res.data?.data ?? res.data
    requests.value = Array.isArray(data) ? data : []
  } catch (e) {
    error.value = e?.response?.data?.message || e?.response?.data?.error || e.message || 'Failed to load requests'
  } finally {
    loading.value = false
  }
}

// --- Shops fetch (region filtered) ---
async function fetchShops() {
  if (!selected.value?.region_id) {
    shops.value = []
    return
  }

  shopsLoading.value = true
  try {
    const params = {
      region_id: selected.value.region_id
    }
    const q = String(shopSearch.value || '').trim()
    if (q) params.q = q

    // Expect array from /shops (your shop.controller currently returns array)
    const res = await api.get('/shops', { params })
    const data = res.data?.data ?? res.data
    shops.value = Array.isArray(data) ? data : []
  } catch {
    shops.value = []
  } finally {
    shopsLoading.value = false
  }
}

// simple debounce without extra libs
let t = null
function debouncedFetchShops() {
  if (t) clearTimeout(t)
  t = setTimeout(() => {
    fetchShops()
  }, 250)
}

// --- Verify & Map modal control ---
function openMap(r) {
  selected.value = r
  mapError.value = ''
  mapForm.value = { shop_id: '', notes: '' }
  physicallyVerified.value = false
  shops.value = []
  shopSearch.value = ''
  mapOpen.value = true
  fetchShops()
}

function closeMap() {
  mapOpen.value = false
  selected.value = null
  physicallyVerified.value = false
}

async function submitMap() {
  mapError.value = ''
  if (!selected.value?.id) return
  if (!selected.value?.region_id) {
    mapError.value = 'Region is missing on this request. Please ensure region_id is saved for the request.'
    return
  }
  if (!mapForm.value.shop_id) {
    mapError.value = 'Please select a shop.'
    return
  }

  mapLoading.value = true
  try {
    await api.post(`/retail-signup/requests/${selected.value.id}/csr-verify`, {
      shop_id: Number(mapForm.value.shop_id),
      notes: mapForm.value.notes || ''
    })

    mapOpen.value = false
    await fetchRequests()
  } catch (e) {
    mapError.value = e?.response?.data?.message || e?.response?.data?.error || e.message || 'Failed to verify & map'
  } finally {
    mapLoading.value = false
  }
}

// --- Reject modal control ---
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
