<!-- src/views/admin/PipelineMonitorView.vue -->
<template>
  <div class="min-h-screen bg-slate-50">
    <div class="max-w-7xl mx-auto p-4 sm:p-6">

      <!-- Header -->
      <div class="mb-5">
        <h1 class="text-xl sm:text-2xl font-bold">Signup Pipeline Monitor</h1>
        <p class="text-sm text-gray-500 mt-1">Full visibility into the CSR → BDM → Approved flow across all regions.</p>
      </div>

      <!-- Loading stats -->
      <div v-if="loading && !rows.length" class="text-center py-16 text-gray-400">Loading pipeline data...</div>

      <template v-else>
        <!-- Stat Cards (8) -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div
            v-for="card in statCards"
            :key="card.key"
            class="bg-white rounded-lg border p-4 text-center cursor-pointer hover:shadow transition"
            :class="{ 'ring-2 ring-indigo-500': filters.status === card.filterStatus }"
            @click="toggleStatusFilter(card.filterStatus)"
          >
            <div class="text-2xl font-bold" :class="card.color">{{ stats[card.key] ?? '-' }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ card.label }}</div>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white border rounded-lg p-4 mb-4 flex flex-wrap gap-3 items-end">
          <div>
            <label class="block text-xs text-gray-500 mb-1">Search</label>
            <input
              type="text"
              v-model="filters.search"
              placeholder="Name or phone..."
              class="border rounded px-3 py-1.5 text-sm w-48"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Status</label>
            <select v-model="filters.status" class="border rounded px-3 py-1.5 text-sm">
              <option value="">All</option>
              <option value="pending">Pending CSR</option>
              <option value="csr_verified">Pending BDM</option>
              <option value="bdm_approved">BDM Approved</option>
              <option value="approved">Active</option>
              <option value="rejected">Rejected</option>
              <option value="overdue">BDM Overdue</option>
              <option value="photo_pending">Photo Pending</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">From</label>
            <input type="date" v-model="filters.date_from" class="border rounded px-3 py-1.5 text-sm" />
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">To</label>
            <input type="date" v-model="filters.date_to" class="border rounded px-3 py-1.5 text-sm" />
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

        <!-- Table -->
        <div v-if="rows.length === 0" class="text-center py-16 text-gray-400">No records match the current filters.</div>
        <div v-else class="bg-white border rounded-lg overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-50 border-b text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th class="px-4 py-3 text-left">#</th>
                <th class="px-4 py-3 text-left">Applicant</th>
                <th class="px-4 py-3 text-left">Phone</th>
                <th class="px-4 py-3 text-left">Applied</th>
                <th class="px-4 py-3 text-left">CSR Stage</th>
                <th class="px-4 py-3 text-left">BDM Stage</th>
                <th class="px-4 py-3 text-left">BDM Due</th>
                <th class="px-4 py-3 text-left">Overall Status</th>
                <th class="px-4 py-3 text-left">Details</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-for="r in rows" :key="r.id" class="hover:bg-slate-50">
                <td class="px-4 py-3 text-gray-400 text-xs">{{ r.id }}</td>
                <td class="px-4 py-3 font-medium">{{ r.user_name }}</td>
                <td class="px-4 py-3 text-gray-500">{{ r.user_phone || '-' }}</td>
                <td class="px-4 py-3 text-gray-500">{{ fmtDate(r.created_at) }}</td>

                <!-- CSR Stage -->
                <td class="px-4 py-3">
                  <div v-if="r.csr_verified_at">
                    <span class="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Verified</span>
                    <div class="text-xs text-gray-400 mt-0.5">{{ r.csr_user_name || 'CSR' }}</div>
                  </div>
                  <span v-else class="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700">Pending</span>
                </td>

                <!-- BDM Stage -->
                <td class="px-4 py-3">
                  <div v-if="r.bdm_status === 'approved'">
                    <span class="px-2 py-0.5 rounded-full text-xs" :class="r.bdm_approval_type === 'temporary' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'">
                      {{ r.bdm_approval_type === 'temporary' ? 'Temporary' : 'Full' }}
                    </span>
                    <div class="text-xs text-gray-400 mt-0.5">{{ r.bdm_user_name || 'BDM' }}</div>
                  </div>
                  <div v-else-if="r.bdm_status === 'rejected'">
                    <span class="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">Rejected</span>
                  </div>
                  <span v-else-if="r.csr_verified_at" class="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700">Queued</span>
                  <span v-else class="text-gray-300 text-xs">-</span>
                </td>

                <!-- BDM Due -->
                <td class="px-4 py-3">
                  <span
                    v-if="r.bdm_due_at"
                    :class="isBdmOverdue(r) ? 'text-red-600 font-semibold text-xs' : 'text-gray-500 text-xs'"
                  >{{ fmtDate(r.bdm_due_at) }}</span>
                  <span v-else class="text-gray-300 text-xs">-</span>
                </td>

                <!-- Overall Status -->
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="overallBadge(r).cls">
                    {{ overallBadge(r).label }}
                  </span>
                </td>

                <td class="px-4 py-3">
                  <button
                    type="button"
                    @click="openDetail(r)"
                    class="px-3 py-1 bg-indigo-50 text-indigo-700 rounded text-xs hover:bg-indigo-100"
                  >View</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>Page {{ page }} of {{ totalPages }} ({{ total }} records)</span>
          <div class="flex gap-2">
            <button type="button" :disabled="page <= 1" @click="load(page - 1)" class="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50">Prev</button>
            <button type="button" :disabled="page >= totalPages" @click="load(page + 1)" class="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        </div>
      </template>
    </div>
  </div>

  <!-- Detail Modal -->
  <div v-if="detail.open" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
      <div class="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white">
        <h2 class="font-bold text-lg">Request Details</h2>
        <button type="button" @click="detail.open = false" class="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
      </div>
      <div v-if="detail.row" class="px-6 py-5 space-y-4 text-sm">
        <div class="grid grid-cols-2 gap-3">
          <div><div class="text-xs text-gray-400">Name</div><div class="font-medium">{{ detail.row.user_name }}</div></div>
          <div><div class="text-xs text-gray-400">Phone</div><div>{{ detail.row.user_phone || '-' }}</div></div>
          <div><div class="text-xs text-gray-400">Applied On</div><div>{{ fmtDate(detail.row.created_at) }}</div></div>
          <div><div class="text-xs text-gray-400">Region</div><div>{{ detail.row.region_name || '-' }}</div></div>
          <div><div class="text-xs text-gray-400">Shop</div><div>{{ detail.row.shop_name || '-' }}</div></div>
          <div><div class="text-xs text-gray-400">Dealer</div><div>{{ detail.row.dealer_name || '-' }}</div></div>
        </div>
        <hr>
        <div class="grid grid-cols-2 gap-3">
          <div><div class="text-xs text-gray-400">CSR Verified</div><div>{{ fmtDate(detail.row.csr_verified_at) || 'Not yet' }}</div></div>
          <div><div class="text-xs text-gray-400">CSR User</div><div>{{ detail.row.csr_user_name || '-' }}</div></div>
          <div><div class="text-xs text-gray-400">BDM Decision</div><div>{{ detail.row.bdm_status || 'pending' }}</div></div>
          <div><div class="text-xs text-gray-400">BDM User</div><div>{{ detail.row.bdm_user_name || '-' }}</div></div>
          <div><div class="text-xs text-gray-400">Approval Type</div><div>{{ detail.row.bdm_approval_type || '-' }}</div></div>
          <div><div class="text-xs text-gray-400">Photo Due</div><div>{{ fmtDate(detail.row.bdm_photo_due_date) || '-' }}</div></div>
          <div><div class="text-xs text-gray-400">Photo Submitted</div><div>{{ fmtDate(detail.row.bdm_photo_completed_at) || '-' }}</div></div>
          <div><div class="text-xs text-gray-400">Escalated</div><div>{{ detail.row.escalated_at ? fmtDate(detail.row.escalated_at) : 'No' }}</div></div>
        </div>
        <template v-if="detail.row.utm_source">
          <hr>
          <div class="grid grid-cols-2 gap-3">
            <div><div class="text-xs text-gray-400">Source</div><div>{{ detail.row.utm_source }}</div></div>
            <div><div class="text-xs text-gray-400">Medium</div><div>{{ detail.row.utm_medium || '-' }}</div></div>
            <div><div class="text-xs text-gray-400">Campaign</div><div>{{ detail.row.utm_campaign || '-' }}</div></div>
          </div>
        </template>
        <template v-if="detail.row.bdm_reject_reason">
          <hr>
          <div><div class="text-xs text-gray-400">Rejection Reason</div><div class="text-red-600">{{ detail.row.bdm_reject_reason }}</div></div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/services/api'

const loading = ref(false)
const rows = ref([])
const total = ref(0)
const page = ref(1)
const perPage = 25

const stats = reactive({
  total: 0,
  pending_csr: 0,
  pending_bdm: 0,
  bdm_overdue: 0,
  photo_pending: 0,
  approved: 0,
  rejected: 0,
  avg_hours_to_approve: null,
})

const statCards = [
  { key: 'total',                label: 'Total Requests',      color: 'text-slate-700',  filterStatus: '' },
  { key: 'pending_csr',          label: 'Pending CSR',         color: 'text-yellow-600', filterStatus: 'pending' },
  { key: 'pending_bdm',          label: 'Queued for BDM',      color: 'text-indigo-600', filterStatus: 'csr_verified' },
  { key: 'bdm_overdue',          label: 'BDM Overdue',         color: 'text-red-600',    filterStatus: 'overdue' },
  { key: 'photo_pending',        label: 'Photo Pending',       color: 'text-amber-600',  filterStatus: 'photo_pending' },
  { key: 'approved',             label: 'Approved / Active',   color: 'text-green-600',  filterStatus: 'approved' },
  { key: 'rejected',             label: 'Rejected',            color: 'text-red-600',    filterStatus: 'rejected' },
  { key: 'avg_hours_to_approve', label: 'Avg Hours to Approve',color: 'text-blue-600',   filterStatus: null },
]

function today() { return new Date().toISOString().split('T')[0] }
function ninetyDaysAgo() {
  return new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
}

const filters = reactive({ search: '', status: '', date_from: ninetyDaysAgo(), date_to: today() })
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage)))

async function load(p = 1) {
  loading.value = true
  page.value = p
  try {
    const params = { page: p, per_page: perPage, ...filters }
    const { data } = await api.get('/retail-signup/admin/pipeline', { params })
    rows.value = data.rows || data.data || []
    total.value = data.total || data.pagination?.total || 0
    if (data.stats) Object.assign(stats, data.stats)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  filters.search = ''
  filters.status = ''
  filters.date_from = ninetyDaysAgo()
  filters.date_to = today()
  load(1)
}

function toggleStatusFilter(s) {
  if (s === null) return
  filters.status = filters.status === s ? '' : s
  load(1)
}

function fmtDate(d) {
  if (!d) return null
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function isBdmOverdue(r) {
  return r.bdm_due_at && new Date(r.bdm_due_at) < new Date() && r.bdm_status === 'pending'
}

function overallBadge(r) {
  if (r.status === 'approved' || r.bdm_status === 'approved') return { label: 'Active', cls: 'bg-green-100 text-green-700' }
  if (r.bdm_status === 'rejected') return { label: 'Rejected', cls: 'bg-red-100 text-red-700' }
  if (isBdmOverdue(r)) return { label: 'BDM Overdue', cls: 'bg-red-100 text-red-700' }
  if (r.bdm_approval_type === 'temporary' && !r.bdm_photo_completed_at) return { label: 'Photo Pending', cls: 'bg-amber-100 text-amber-700' }
  if (r.csr_verified_at && r.bdm_status === 'pending') return { label: 'Awaiting BDM', cls: 'bg-indigo-100 text-indigo-700' }
  return { label: 'Pending CSR', cls: 'bg-yellow-100 text-yellow-700' }
}

// Detail modal
const detail = reactive({ open: false, row: null })

function openDetail(r) {
  detail.row = r
  detail.open = true
}

onMounted(() => load(1))
</script>
