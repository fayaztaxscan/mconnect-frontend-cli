<!-- src/views/settings/ShopsList.vue -->
<template>
  <div class="p-4 max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Shop Management</h1>
      <router-link
        :to="{ name: 'AddShop' }"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
      >
        New Shop
      </router-link>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border-collapse">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-4 py-2 border">Code</th>
            <th class="px-4 py-2 border">Name</th>
            <th class="px-4 py-2 border">Region</th>
            <th class="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="shop in shops"
            :key="shop.id"
            class="hover:bg-gray-50"
          >
            <td class="px-4 py-2 border">{{ shop.shop_code }}</td>
            <td class="px-4 py-2 border">{{ shop.name }}</td>
            <td class="px-4 py-2 border">{{ shop.region_name || '—' }}</td>
            <td class="px-4 py-2 border space-x-2">
              <router-link
                :to="{ name: 'ShopDetails', params: { id: shop.id } }"
                class="text-blue-600 hover:underline"
              >View</router-link>
              <router-link
                :to="{ name: 'EditShop', params: { id: shop.id } }"
                class="text-green-600 hover:underline"
              >Edit</router-link>
              <button
                @click="deleteShop(shop.id)"
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
  name: 'ShopsList',
  data() {
    return {
      shops: [],
      loading: false,
      error: ''
    };
  },
  methods: {
    async fetchShops() {
      this.loading = true;
      this.error   = '';
      try {
        const { data } = await api.get('/shops');
        this.shops = data;
      } catch (err) {
        this.error = err.response?.data?.error || 'Failed to load shops.';
      } finally {
        this.loading = false;
      }
    },
    async deleteShop(id) {
      if (!confirm('Delete this shop?')) return;
      try {
        await api.delete(`/shops/${id}`);
        this.fetchShops();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete.');
      }
    }
  },
  created() {
    this.fetchShops();
  }
};
</script>

<style scoped>
/* Tailwind handles styling */
</style>
