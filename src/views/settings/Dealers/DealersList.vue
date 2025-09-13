<!-- src/views/settings/DealersList.vue -->
<template>
  <div class="p-4 max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Dealers Management</h1>
      <router-link
        :to="{ name: 'AddDealer' }"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
      >
        New Dealer
      </router-link>
    </div>

    <div class="overflow-x-auto bg-white border rounded">
      <table class="min-w-full border-collapse">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-4 py-2 border text-left">Code</th>
            <th class="px-4 py-2 border text-left">Name</th>
            <th class="px-4 py-2 border text-left">Region</th>
            <th class="px-4 py-2 border text-left">Status</th>
            <th class="px-4 py-2 border text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="px-4 py-6 text-center text-gray-500">Loading…</td>
          </tr>

          <tr v-else-if="error">
            <td colspan="5" class="px-4 py-6 text-center text-red-600">{{ error }}</td>
          </tr>

          <tr v-else-if="dealers.length === 0">
            <td colspan="5" class="px-4 py-6 text-center text-gray-500">No dealers found</td>
          </tr>

          <tr
            v-else
            v-for="dealer in dealers"
            :key="dealer.id"
            class="hover:bg-gray-50"
          >
            <td class="px-4 py-2 border">{{ dealer.dealer_code }}</td>
            <td class="px-4 py-2 border">{{ dealer.name }}</td>
            <td class="px-4 py-2 border">{{ dealer.region_id }}</td>
            <td class="px-4 py-2 border capitalize">{{ dealer.status }}</td>
            <td class="px-4 py-2 border space-x-3">
              <router-link
                :to="{ name: 'DealerDetails', params: { id: dealer.id } }"
                class="text-blue-600 hover:underline"
              >View</router-link>
              <router-link
                :to="{ name: 'EditDealer', params: { id: dealer.id } }"
                class="text-green-600 hover:underline"
              >Edit</router-link>
              <button
                @click="onDelete(dealer.id)"
                class="text-red-600 hover:underline"
              >Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { listDealers, deleteDealer } from '@/services/dealers' // <-- uses baseURL '/api'

export default {
  name: 'DealersList',
  data() {
    return {
      dealers: [],
      loading: false,
      error: ''
    }
  },
  methods: {
    async fetchDealers() {
      this.loading = true
      this.error = ''
      try {
        this.dealers = await listDealers()   // <-- calls GET '/dealers'
      } catch (err) {
        this.error = err?.response?.data?.error || 'Failed to load dealers.'
      } finally {
        this.loading = false
      }
    },
    async onDelete(id) {
      if (!confirm('Delete this dealer?')) return
      try {
        await deleteDealer(id)               // <-- calls DELETE '/dealers/:id'
        this.fetchDealers()
      } catch (err) {
        alert(err?.response?.data?.error || 'Failed to delete.')
      }
    }
  },
  created() {
    this.fetchDealers()
  }
}
</script>

<style scoped>
/* Tailwind handles styling */
</style>
