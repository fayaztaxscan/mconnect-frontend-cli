<!-- src/views/Dealers/DealersList.vue (or src/views/settings/DealersList.vue) -->
<template>
  <div class="p-4 max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <h1 class="text-2xl font-bold">Dealers</h1>
      <router-link
        :to="{ name: 'AddDealer' }"
        class="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        New Dealer
      </router-link>
    </div>

    <!-- Filters -->
    <div class="bg-white border rounded p-3 mb-3">
      <div class="grid grid-cols-1 sm:grid-cols-7 gap-3">
        <div class="sm:col-span-2">
          <label class="block text-xs text-slate-500 mb-1">Search</label>
          <input
            v-model="filters.q"
            @input="debouncedFetch"
            placeholder="Code, name, city, email, phone…"
            class="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label class="block text-xs text-slate-500 mb-1">Status</label>
          <select v-model="filters.status" @change="onFilterChange" class="w-full border rounded px-3 py-2">
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label class="block text-xs text-slate-500 mb-1">City</label>
          <input v-model="filters.city" @change="onFilterChange" class="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label class="block text-xs text-slate-500 mb-1">Region</label>
          <select v-model="filters.region_id" @change="onFilterChange" class="w-full border rounded px-3 py-2">
            <option :value="''">All regions</option>
            <option v-for="r in regions" :key="r.id" :value="r.id">{{ r.name }}</option>
          </select>
        </div>

        <div class="sm:col-span-2">
          <label class="block text-xs text-slate-500 mb-1">Brand</label>
          <select v-model="filters.brand_id" @change="onFilterChange" class="w-full border rounded px-3 py-2">
            <option :value="''">All brands</option>
            <option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto bg-white border rounded">
      <table class="min-w-full border-collapse">
        <thead>
          <tr class="bg-gray-50 text-left text-sm">
            <th class="px-4 py-2 border">Logo</th>

            <th class="px-4 py-2 border">
              <button class="font-medium hover:underline" @click="onSort('dealer_code')">
                Code <SortIcon :active="meta.sortBy==='dealer_code'" :dir="meta.sortDir" />
              </button>
            </th>

            <th class="px-4 py-2 border">
              <button class="font-medium hover:underline" @click="onSort('name')">
                Name <SortIcon :active="meta.sortBy==='name'" :dir="meta.sortDir" />
              </button>
            </th>

            <th class="px-4 py-2 border">
              <button class="font-medium hover:underline" @click="onSort('city')">
                City <SortIcon :active="meta.sortBy==='city'" :dir="meta.sortDir" />
              </button>
            </th>

            <th class="px-4 py-2 border">
              <button class="font-medium hover:underline" @click="onSort('region_name')">
                Region <SortIcon :active="meta.sortBy==='region_name'" :dir="meta.sortDir" />
              </button>
            </th>

            <!-- NEW: Brand column with sort -->
            <th class="px-4 py-2 border">
              <button class="font-medium hover:underline" @click="onSort('brand_name')">
                Brand <SortIcon :active="meta.sortBy==='brand_name'" :dir="meta.sortDir" />
              </button>
            </th>

            <th class="px-4 py-2 border text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          <!-- Loading -->
          <tr v-if="loading">
            <td colspan="7" class="px-4 py-8 text-center text-gray-500">Loading…</td>
          </tr>

          <!-- Error -->
          <tr v-else-if="error">
            <td colspan="7" class="px-4 py-8 text-center text-red-600">{{ error }}</td>
          </tr>

          <!-- Empty -->
          <tr v-else-if="rows.length === 0">
            <td colspan="7" class="px-4 py-8 text-center text-gray-500">No dealers found</td>
          </tr>

          <!-- Rows -->
          <tr v-else v-for="d in rows" :key="d.id" class="hover:bg-gray-50">
            <td class="px-4 py-2 border">
              <div class="h-10 w-10 rounded bg-white border overflow-hidden flex items-center justify-center">
                <img v-if="d.logo_url" :src="d.logo_url" alt="" class="h-10 w-10 object-contain" />
                <span v-else class="text-xs text-slate-400">—</span>
              </div>
            </td>

            <td class="px-4 py-2 border font-mono text-sm">{{ d.dealer_code }}</td>

            <td class="px-4 py-2 border">
              <div class="font-medium">{{ d.name }}</div>
              <div class="text-xs text-slate-500 truncate">
                <span v-if="d.email">{{ d.email }}</span>
                <span v-if="d.email && d.primary_contact_phone"> · </span>
                <span v-if="d.primary_contact_phone">{{ d.primary_contact_phone }}</span>
              </div>
              <div v-if="d.website_url" class="text-xs">
                <a :href="d.website_url" target="_blank" rel="noopener" class="text-indigo-600 hover:underline">
                  {{ d.website_url }}
                </a>
              </div>
            </td>

            <td class="px-4 py-2 border">
              <div class="text-sm">{{ d.city || '—' }}</div>
              <div v-if="d.postal_code" class="text-xs text-slate-500">{{ d.postal_code }}</div>
            </td>

            <!-- Region name (not ID) -->
            <td class="px-4 py-2 border">
              <div class="text-sm">{{ d.region_name || '—' }}</div>
            </td>

            <!-- NEW: Brand name -->
            <td class="px-4 py-2 border">
              <div class="text-sm">{{ d.brand_name || '—' }}</div>
            </td>

            <td class="px-4 py-2 border">
              <div class="flex items-center justify-end gap-3">
                <router-link
                  :to="{ name: 'DealerDetails', params: { id: d.id } }"
                  class="text-blue-600 hover:underline"
                >View</router-link>
                <router-link
                  :to="{ name: 'EditDealer', params: { id: d.id } }"
                  class="text-green-600 hover:underline"
                >Edit</router-link>
                <button @click="onDelete(d.id)" class="text-red-600 hover:underline">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div class="text-sm text-slate-600">
        <span v-if="meta.total > 0">
          Showing <strong>{{ rangeStart }}</strong>–<strong>{{ rangeEnd }}</strong>
          of <strong>{{ meta.total }}</strong>
        </span>
      </div>

      <div class="flex items-center gap-2">
        <label class="text-sm text-slate-600">Per page</label>
        <select v-model.number="meta.limit" @change="onPerPage" class="border rounded px-2 py-1">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>

        <button
          class="ml-2 px-3 py-1 border rounded disabled:opacity-50"
          :disabled="meta.page <= 1 || loading"
          @click="goPrev"
        >Prev</button>
        <span class="text-sm">Page {{ meta.page }} / {{ meta.pages || 1 }}</span>
        <button
          class="px-3 py-1 border rounded disabled:opacity-50"
          :disabled="meta.page >= meta.pages || loading"
          @click="goNext"
        >Next</button>
      </div>
    </div>
  </div>
</template>

<script>
import { listDealers, deleteDealer } from '@/services/dealers'
import { listRegions } from '@/services/regions'
import { listBrands } from '@/services/brands'

/** Tiny sort icon component */
const SortIcon = {
  name: 'SortIcon',
  props: { active: Boolean, dir: String },
  template: `
    <span class="inline-block w-3 h-3 ml-1 align-middle opacity-60" v-if="active">
      <svg viewBox="0 0 20 20" class="w-3 h-3">
        <path v-if="dir==='asc'" d="M10 5l5 6H5l5-6z" fill="currentColor"></path>
        <path v-else d="M10 15l-5-6h10l-5 6z" fill="currentColor"></path>
      </svg>
    </span>
  `
}

export default {
  name: 'DealersList',
  components: { SortIcon },
  data() {
    return {
      loading: false,
      error: '',
      rows: [],
      regions: [],
      brands: [],
      meta: {
        page: 1, pages: 1, limit: 20, total: 0,
        sortBy: 'created_at', sortDir: 'desc'
      },
      filters: {
        q: '',
        status: '',
        city: '',
        region_id: '', // '' means all
        brand_id: ''   // '' means all
      },
      _debounceId: null
    }
  },
  computed: {
    rangeStart() {
      if (this.meta.total === 0) return 0
      return (this.meta.page - 1) * this.meta.limit + 1
    },
    rangeEnd() {
      const end = this.meta.page * this.meta.limit
      return Math.min(end, this.meta.total)
    }
  },
  methods: {
    async fetch() {
      this.loading = true
      this.error = ''
      try {
        const params = {
          ...this.filters,
          page: this.meta.page,
          limit: this.meta.limit,
          sortBy: this.meta.sortBy,
          sortDir: this.meta.sortDir
        }
        // prune empty filters
        if (params.region_id === '') delete params.region_id
        if (params.brand_id === '') delete params.brand_id

        const res = await listDealers(params)
        if (Array.isArray(res)) {
          this.rows = res
          this.meta.total = res.length
          this.meta.pages = 1
        } else {
          this.rows = res.data || []
          this.meta.page = res.page || 1
          this.meta.limit = res.limit || 20
          this.meta.total = res.total || this.rows.length
          this.meta.pages = res.pages || 1
          this.meta.sortBy = res.sortBy || this.meta.sortBy
          this.meta.sortDir = res.sortDir || this.meta.sortDir
        }
      } catch (err) {
        this.error = err?.response?.data?.error || 'Failed to load dealers.'
      } finally {
        this.loading = false
      }
    },
    debouncedFetch() {
      clearTimeout(this._debounceId)
      this._debounceId = setTimeout(() => {
        this.meta.page = 1
        this.fetch()
      }, 300)
    },
    onFilterChange() {
      this.meta.page = 1
      this.fetch()
    },
    onPerPage() {
      this.meta.page = 1
      this.fetch()
    },
    async onDelete(id) {
      if (!confirm('Delete this dealer?')) return
      try {
        await deleteDealer(id)
        if (this.rows.length === 1 && this.meta.page > 1) {
          this.meta.page -= 1
        }
        this.fetch()
      } catch (err) {
        alert(err?.response?.data?.error || 'Failed to delete.')
      }
    },
    goPrev() {
      if (this.meta.page > 1) {
        this.meta.page -= 1
        this.fetch()
      }
    },
    goNext() {
      if (this.meta.page < this.meta.pages) {
        this.meta.page += 1
        this.fetch()
      }
    },
    onSort(col) {
      if (this.meta.sortBy === col) {
        this.meta.sortDir = this.meta.sortDir === 'asc' ? 'desc' : 'asc'
      } else {
        this.meta.sortBy = col
        this.meta.sortDir = 'asc'
      }
      this.meta.page = 1
      this.fetch()
    }
  },
  async created() {
    try {
      this.regions = await listRegions()
    } catch (e) {
      console.warn('Failed to load regions (non-fatal)', e)
    }
    try {
      this.brands = await listBrands()
    } catch (e) {
      console.warn('Failed to load brands (non-fatal)', e)
    }
    this.fetch()
  },
  beforeUnmount() {
    clearTimeout(this._debounceId)
  }
}
</script>

<style scoped>
/* Tailwind handles most styling */
</style>
