<!-- src/views/admin/UTMAnalyticsView.vue -->
<template>
  <div class="min-h-screen bg-slate-50">
    <div class="max-w-6xl mx-auto p-4 sm:p-6">

      <!-- Header -->
      <div class="mb-5">
        <h1 class="text-xl sm:text-2xl font-bold">UTM Analytics</h1>
        <p class="text-sm text-gray-500 mt-1">Where applicants heard about you — source, channel and campaign breakdown.</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-16 text-gray-400">Loading analytics...</div>

      <template v-else>

        <!-- Conversion summary -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div class="bg-white rounded-lg border p-4 text-center">
            <div class="text-2xl font-bold text-slate-700">{{ summary.total_visits ?? '-' }}</div>
            <div class="text-xs text-gray-500 mt-1">Total Visits</div>
          </div>
          <div class="bg-white rounded-lg border p-4 text-center">
            <div class="text-2xl font-bold text-indigo-600">{{ summary.total_signups ?? '-' }}</div>
            <div class="text-xs text-gray-500 mt-1">Signups</div>
          </div>
          <div class="bg-white rounded-lg border p-4 text-center">
            <div class="text-2xl font-bold text-green-600">{{ summary.approved ?? '-' }}</div>
            <div class="text-xs text-gray-500 mt-1">Approved</div>
          </div>
          <div class="bg-white rounded-lg border p-4 text-center">
            <div class="text-2xl font-bold text-amber-600">{{ conversionRate }}%</div>
            <div class="text-xs text-gray-500 mt-1">Visit → Signup Rate</div>
          </div>
        </div>

        <!-- Two-column layout: Source + Channel -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

          <!-- Source Breakdown -->
          <div class="bg-white border rounded-lg p-5">
            <h2 class="font-semibold mb-4">By Source</h2>
            <div v-if="bySource.length === 0" class="text-sm text-gray-400">No data</div>
            <div v-else class="space-y-3">
              <div v-for="s in bySource" :key="s.utm_source" class="flex items-center gap-3">
                <div class="w-28 text-sm font-medium truncate shrink-0">{{ sourceLabel(s.utm_source) }}</div>
                <div class="flex-1">
                  <div class="h-5 bg-indigo-100 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-indigo-500 rounded-full transition-all"
                      :style="{ width: barPct(s.count, maxSourceCount) + '%' }"
                    ></div>
                  </div>
                </div>
                <div class="text-sm font-semibold w-10 text-right shrink-0">{{ s.count }}</div>
              </div>
            </div>
          </div>

          <!-- Channel (Medium) Breakdown -->
          <div class="bg-white border rounded-lg p-5">
            <h2 class="font-semibold mb-4">By Channel (Medium)</h2>
            <div v-if="byMedium.length === 0" class="text-sm text-gray-400">No data</div>
            <div v-else class="space-y-3">
              <div v-for="m in byMedium" :key="m.utm_medium" class="flex items-center gap-3">
                <div class="w-28 text-sm font-medium truncate shrink-0">{{ mediumLabel(m.utm_medium) }}</div>
                <div class="flex-1">
                  <div class="h-5 bg-emerald-100 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-emerald-500 rounded-full transition-all"
                      :style="{ width: barPct(m.count, maxMediumCount) + '%' }"
                    ></div>
                  </div>
                </div>
                <div class="text-sm font-semibold w-10 text-right shrink-0">{{ m.count }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Campaign Table -->
        <div class="bg-white border rounded-lg p-5">
          <h2 class="font-semibold mb-4">Campaign Breakdown</h2>
          <div v-if="byCampaign.length === 0" class="text-sm text-gray-400">No campaign data found.</div>
          <table v-else class="min-w-full text-sm">
            <thead class="border-b text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th class="pb-2 text-left">Campaign</th>
                <th class="pb-2 text-left">Source</th>
                <th class="pb-2 text-right">Signups</th>
                <th class="pb-2 text-right">Approved</th>
                <th class="pb-2 text-right">Conversion</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-for="c in byCampaign" :key="c.utm_campaign" class="hover:bg-slate-50">
                <td class="py-2 pr-4 font-medium">{{ c.utm_campaign || '(not set)' }}</td>
                <td class="py-2 pr-4 text-gray-500">{{ sourceLabel(c.utm_source) }}</td>
                <td class="py-2 text-right">{{ c.count }}</td>
                <td class="py-2 text-right text-green-600">{{ c.approved ?? 0 }}</td>
                <td class="py-2 text-right text-indigo-600">
                  {{ c.count > 0 ? Math.round(((c.approved ?? 0) / c.count) * 100) : 0 }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/services/api'

const SOURCE_LABELS = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  google: 'Google',
  referral: 'Referral',
  organic: 'Organic',
  email: 'Email',
  sms: 'SMS',
  youtube: 'YouTube',
  twitter: 'Twitter/X',
  linkedin: 'LinkedIn',
  direct: 'Direct',
}

const MEDIUM_LABELS = {
  cpc: 'Paid (CPC)',
  social: 'Social',
  email: 'Email',
  organic: 'Organic',
  referral: 'Referral',
  sms: 'SMS',
  push: 'Push Notification',
  affiliate: 'Affiliate',
  display: 'Display',
  video: 'Video',
}

const loading = ref(false)
const bySource = ref([])
const byMedium = ref([])
const byCampaign = ref([])
const summary = reactive({ total_visits: null, total_signups: null, approved: null })

const maxSourceCount = computed(() => Math.max(1, ...bySource.value.map(s => s.count)))
const maxMediumCount = computed(() => Math.max(1, ...byMedium.value.map(m => m.count)))

const conversionRate = computed(() => {
  if (!summary.total_visits || !summary.total_signups) return 0
  return Math.round((summary.total_signups / summary.total_visits) * 100)
})

function sourceLabel(src) {
  return SOURCE_LABELS[src?.toLowerCase()] || src || '(direct)'
}

function mediumLabel(med) {
  return MEDIUM_LABELS[med?.toLowerCase()] || med || '(none)'
}

function barPct(val, max) {
  return max > 0 ? Math.round((val / max) * 100) : 0
}

async function load() {
  loading.value = true
  try {
    const { data } = await api.get('/retail-signup/admin/utm-analytics')
    bySource.value = data.by_source || []
    byMedium.value = data.by_medium || []
    byCampaign.value = data.by_campaign || []
    if (data.summary) Object.assign(summary, data.summary)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
