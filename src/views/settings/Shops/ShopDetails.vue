<!-- src/views/settings/ShopDetails.vue -->
<template>
  <div class="p-4 max-w-md mx-auto mt-8">
    <h1 class="text-2xl font-semibold mb-4">Shop Details</h1>

    <div v-if="loading" class="text-center py-8">Loading...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>

    <div v-else class="space-y-2 bg-white p-6 rounded-lg shadow-md">
      <p><strong>Code:</strong> {{ shop.shop_code }}</p>
      <p><strong>Name:</strong> {{ shop.name }}</p>
      <p><strong>Address:</strong> {{ shop.address }}</p>
      <p><strong>Contact:</strong> {{ shop.contact_name }} ({{ shop.contact_phone }})</p>
      <p><strong>Email:</strong> {{ shop.email }}</p>
      <p><strong>Location:</strong> {{ shop.location }}</p>
      <p><strong>Region:</strong> {{ shop.region_name || '—' }}</p>
      <p><strong>Status:</strong> {{ shop.status }}</p>
      <p><strong>Created At:</strong> {{ formatDate(shop.created_at) }}</p>
      <p><strong>Updated At:</strong> {{ formatDate(shop.updated_at) }}</p>
    </div>

    <div class="mt-6 flex space-x-3 justify-end">
      <router-link
        :to="{ name: 'EditShop', params: { id: shop.id } }"
        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        Edit
      </router-link>
      <router-link
        :to="{ name: 'ShopsList' }"
        class="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
      >
        Back
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';

const route = useRoute();
const id = route.params.id;

const shop = ref(null);
const loading = ref(false);
const error = ref('');

// helper to format ISO timestamps
function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString();
}

async function fetchShop() {
  loading.value = true;
  try {
    const { data } = await api.get(`/shops/${id}`);
    shop.value = data;
  } catch (err) {
    error.value = 'Failed to load shop';
  } finally {
    loading.value = false;
  }
}

fetchShop();
</script>

<style scoped>
/* All styling via Tailwind utilities */
</style>
