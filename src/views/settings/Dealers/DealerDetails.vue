// src/views/settings/DealerDetails.vue
<template>
  <div class="p-4 max-w-md mx-auto">
    <h1 class="text-2xl font-semibold mb-4">Dealer Details</h1>

    <div v-if="loading" class="text-center">Loading...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else class="space-y-2">
      <div><strong>Code:</strong> {{ dealer.dealer_code }}</div>
      <div><strong>Name:</strong> {{ dealer.name }}</div>
      <div><strong>Address:</strong> {{ dealer.address }}</div>
      <div><strong>Contact:</strong> {{ dealer.primary_contact_name }} ({{ dealer.primary_contact_phone }})</div>
      <div><strong>Email:</strong> {{ dealer.email }}</div>
      <div><strong>Region:</strong> {{ dealer.region_id }}</div>
      <div><strong>Status:</strong> {{ dealer.status }}</div>
    </div>

    <div class="mt-4 flex space-x-2">
      <router-link :to="{ name: 'EditDealer', params: { id: dealer.id } }" class="px-4 py-2 bg-green-600 text-white rounded">Edit</router-link>
      <router-link :to="{ name: 'DealersList' }" class="px-4 py-2">Back</router-link>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';
export default {
  name: 'DealerDetails',
  props: ['id'],
  data() {
    return {
      dealer: null,
      loading: false,
      error: ''
    };
  },
  async created() {
    this.loading = true;
    try {
      const { data } = await api.get(`/dealers/${this.id}`);
      this.dealer = data;
    } catch (err) {
      this.error = err.response?.data?.error || 'Failed to load dealer';
    } finally {
      this.loading = false;
    }
  }
};
</script>
