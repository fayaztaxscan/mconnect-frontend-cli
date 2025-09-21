<!-- src/views/settings/DealerDetails.vue -->
<template>
  <div class="p-4 max-w-3xl mx-auto">
    <h1 class="sr-only">Dealer Details</h1>

    <!-- Loading / Error -->
    <div v-if="loading" class="text-center text-gray-500 py-10">Loading...</div>
    <div v-else-if="error" class="text-red-500 py-10 text-center">{{ error }}</div>

    <!-- Content -->
    <div v-else-if="dealer" class="bg-white border rounded p-4 sm:p-6 space-y-6">
      <!-- Header: Logo + Name/Code + Status -->
      <div class="flex items-start gap-4">
        <div class="h-16 w-16 rounded border bg-white flex items-center justify-center overflow-hidden">
          <img
            v-if="dealer.logo_url && !logoBroken"
            :src="dealer.logo_url"
            alt="Dealer Logo"
            class="h-16 w-16 object-contain"
            @error="logoBroken = true"
          />
          <span v-else class="text-xs text-slate-400">No Logo</span>
        </div>

        <div class="flex-1">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <div class="text-xl font-semibold">{{ dealer.name }}</div>
              <div class="text-sm text-slate-500">
                Code: <span class="font-mono">{{ dealer.dealer_code }}</span>
              </div>
            </div>

            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
              :class="dealer.status === 'active'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'"
            >
              {{ dealer.status }}
            </span>
          </div>

          <!-- Brand & Website chips -->
          <div class="mt-2 flex flex-wrap gap-2">
            <span
              v-if="dealer.brand_name || dealer.brand_id"
              class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border"
            >
              <span class="text-slate-500">Brand:</span>
              <span class="font-medium">{{ dealer.brand_name || '—' }}</span>
            </span>

            <a
              v-if="dealer.website_url"
              :href="dealer.website_url"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border text-indigo-700 hover:bg-indigo-50"
              title="Open website"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3a9 9 0 019 9 9 9 0 11-9-9zm0 2a7 7 0 100 14 7 7 0 000-14z"/><path d="M8 12h8M12 8v8"/>
              </svg>
              {{ dealer.website_url }}
            </a>
          </div>

          <!-- Quick actions -->
          <div class="mt-3 flex flex-wrap gap-2">
            <a
              v-if="dealer.primary_contact_phone"
              :href="`tel:${dealer.primary_contact_phone}`"
              class="text-xs px-2 py-1 rounded border hover:bg-slate-50"
              title="Call"
            >Call</a>
            <a
              v-if="dealer.email"
              :href="`mailto:${dealer.email}`"
              class="text-xs px-2 py-1 rounded border hover:bg-slate-50"
              title="Email"
            >Email</a>
            <a
              v-if="dealer.website_url"
              :href="dealer.website_url"
              target="_blank"
              rel="noopener"
              class="text-xs px-2 py-1 rounded border hover:bg-slate-50"
              title="Visit site"
            >Visit site</a>
          </div>
        </div>
      </div>

      <!-- Contact / Region / City / Country / Postal -->
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <div class="text-xs uppercase tracking-wide text-slate-500 mb-1">Primary Contact</div>
          <div class="text-sm">
            <span>{{ dealer.primary_contact_name || '—' }}</span>
            <template v-if="dealer.primary_contact_phone">
              <span class="text-slate-500"> · </span>
              <a :href="`tel:${dealer.primary_contact_phone}`" class="text-indigo-700 hover:underline">
                {{ dealer.primary_contact_phone }}
              </a>
            </template>
          </div>
        </div>
        <div>
          <div class="text-xs uppercase tracking-wide text-slate-500 mb-1">Email</div>
          <div class="text-sm">
            <template v-if="dealer.email">
              <a :href="`mailto:${dealer.email}`" class="text-indigo-700 hover:underline">{{ dealer.email }}</a>
            </template>
            <template v-else>—</template>
          </div>
        </div>
        <div>
          <div class="text-xs uppercase tracking-wide text-slate-500 mb-1">Region</div>
          <div class="text-sm">{{ regionName || '—' }}</div>
        </div>
        <div>
          <div class="text-xs uppercase tracking-wide text-slate-500 mb-1">Country</div>
          <div class="text-sm">{{ dealer.country || '—' }}</div>
        </div>
        <div>
          <div class="text-xs uppercase tracking-wide text-slate-500 mb-1">City</div>
          <div class="text-sm">{{ dealer.city || '—' }}</div>
        </div>
        <div>
          <div class="text-xs uppercase tracking-wide text-slate-500 mb-1">Postal Code</div>
          <div class="text-sm">{{ dealer.postal_code || '—' }}</div>
        </div>
      </div>

      <!-- Address -->
      <div>
        <div class="text-xs uppercase tracking-wide text-slate-500 mb-1">Full Address</div>
        <div class="whitespace-pre-line text-sm">
          {{ dealer.address || '—' }}
        </div>
      </div>

      <!-- Meta -->
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <div class="text-xs uppercase tracking-wide text-slate-500 mb-1">Created</div>
          <div class="text-sm">{{ fmtDate(dealer.created_at) }}</div>
        </div>
        <div>
          <div class="text-xs uppercase tracking-wide text-slate-500 mb-1">Dealer Code</div>
          <div class="text-sm font-mono">{{ dealer.dealer_code }}</div>
        </div>
      </div>

      <!-- Actions -->
      <div class="pt-2 flex gap-2">
        <router-link
          :to="{ name: 'EditDealer', params: { id: dealer.id } }"
          class="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
        >
          Edit
        </router-link>
        <router-link :to="{ name: 'DealersList' }" class="px-4 py-2 border rounded">
          Back
        </router-link>
      </div>
    </div>

    <!-- Fallback -->
    <div v-else class="text-center text-slate-500 py-10">Dealer not found.</div>
  </div>
</template>

<script>
import { getDealer } from '@/services/dealers'
import { listRegions } from '@/services/regions'

export default {
  name: 'DealerDetails',
  props: ['id'],
  data() {
    return {
      dealer: null,
      loading: false,
      error: '',
      regions: [],
      logoBroken: false
    }
  },
  computed: {
    regionName() {
      // Prefer API-provided region_name; fall back to local lookup if needed
      if (this.dealer?.region_name) return this.dealer.region_name
      if (!this.dealer?.region_id) return ''
      const found = this.regions.find(r => r.id === this.dealer.region_id)
      return found ? found.name : ''
    }
  },
  methods: {
    async fetchAll() {
      this.loading = true
      this.error = ''
      try {
        // Dealer includes: brand_id, brand_name, website_url, country, etc.
        this.dealer = await getDealer(this.id || this.$route.params.id)
        // Regions list for fallback lookup
        try {
          this.regions = await listRegions()
        } catch {
          /* non-fatal */
        }
      } catch (err) {
        this.error = err?.response?.data?.error || 'Failed to load dealer'
      } finally {
        this.loading = false
      }
    },
    fmtDate(val) {
      if (!val) return '—'
      try {
        const d = new Date(val)
        if (Number.isNaN(d.getTime())) return String(val)
        return d.toLocaleString()
      } catch {
        return String(val)
      }
    }
  },
  created() {
    this.fetchAll()
  },
  watch: {
    '$route.params.id'(n, o) {
      if (n && n !== o) {
        this.logoBroken = false
        this.fetchAll()
      }
    }
  }
}
</script>

<style scoped>
/* Tailwind handles styling */
</style>
