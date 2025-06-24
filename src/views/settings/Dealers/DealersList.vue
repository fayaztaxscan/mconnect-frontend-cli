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

    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border-collapse">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-4 py-2 border">Code</th>
            <th class="px-4 py-2 border">Name</th>
            <th class="px-4 py-2 border">Region</th>
            <th class="px-4 py-2 border">Status</th>
            <th class="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="dealer in dealers"
            :key="dealer.id"
            class="hover:bg-gray-50"
          >
            <td class="px-4 py-2 border">{{ dealer.dealer_code }}</td>
            <td class="px-4 py-2 border">{{ dealer.name }}</td>
            <td class="px-4 py-2 border">{{ dealer.region_id }}</td>
            <td class="px-4 py-2 border">{{ dealer.status }}</td>
            <td class="px-4 py-2 border space-x-2">
              <router-link
                :to="{ name: 'DealerDetails', params: { id: dealer.id } }"
                class="text-blue-600 hover:underline"
              >View</router-link>
              <router-link
                :to="{ name: 'EditDealer', params: { id: dealer.id } }"
                class="text-green-600 hover:underline"
              >Edit</router-link>
              <button
                @click="deleteDealer(dealer.id)"
                class="text-red-600 hover:underline"
              >Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="loading" class="mt-4 text-center">Loading...</div>
    <div v-if="error" class="mt-4 text-red-500">{{ error }}</div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'DealersList',
  data() {
    return {
      dealers: [],
      loading: false,
      error: ''
    };
  },
  methods: {
    async fetchDealers() {
      this.loading = true;
      this.error   = '';
      try {
        const { data } = await api.get('/dealers');
        this.dealers = data;
      } catch (err) {
        this.error = err.response?.data?.error || 'Failed to load dealers.';
      } finally {
        this.loading = false;
      }
    },
    async deleteDealer(id) {
      if (!confirm('Delete this dealer?')) return;
      try {
        await api.delete(`/dealers/${id}`);
        this.fetchDealers();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete.');
      }
    }
  },
  created() {
    this.fetchDealers();
  }
};
</script>

<style scoped>
/* Tailwind handles styling */
</style>
