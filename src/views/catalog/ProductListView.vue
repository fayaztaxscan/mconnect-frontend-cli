<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-semibold">Product Catalogue</h1>
      <!-- “Add New Product” button on this page -->
      <router-link
        :to="{ name: 'CreateProduct' }"
        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        + New Product
      </router-link>
    </div>

    <table class="min-w-full bg-white border">
      <thead class="bg-gray-100">
        <tr>
          <th class="px-4 py-2 border">SKU</th>
          <th class="px-4 py-2 border">Name</th>
          <th class="px-4 py-2 border">Category</th>
          <th class="px-4 py-2 border">Price</th>
          <th class="px-4 py-2 border">Stock</th>
          <th class="px-4 py-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50">
          <td class="px-4 py-2 border">{{ product.sku }}</td>
          <td class="px-4 py-2 border">{{ product.name }}</td>
          <td class="px-4 py-2 border">{{ categoryMap[product.category_id] || '-' }}</td>
          <td class="px-4 py-2 border">₹{{ product.price.toFixed(2) }}</td>
          <td class="px-4 py-2 border">{{ product.stock_quantity }}</td>
          <td class="px-4 py-2 border">
            <router-link
              :to="{ name: 'EditProduct', params: { id: product.id } }"
              class="text-indigo-600 hover:underline"
            >
              Edit
            </router-link>
          </td>
        </tr>
        <tr v-if="!products.length">
          <td colspan="6" class="text-center py-4 text-gray-500">No products found.</td>
        </tr>
      </tbody>
    </table>

    <div v-if="error" class="mt-4 text-red-600">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';

const products = ref([]);
const categories = ref([]);
const error = ref('');

// Fetch all categories for lookup map
async function fetchCategories() {
  try {
    const { data } = await api.get('/categories');
    categories.value = data;
  } catch (e) {
    console.error('Failed to load categories:', e);
  }
}

// Build category_id → category name map
const categoryMap = computed(() => {
  const map = {};
  categories.value.forEach((c) => {
    map[c.id] = c.name;
  });
  return map;
});

// Fetch all products
async function fetchProducts() {
  error.value = '';
  try {
    const { data } = await api.get('/products');
    products.value = data;
  } catch (e) {
    error.value = 'Failed to load products: ' + (e.response?.data?.message || e.message);
    console.error(e);
  }
}

onMounted(async () => {
  await fetchCategories();
  await fetchProducts();
});
</script>

<style scoped>
table {
  border-collapse: collapse;
}
th,
td {
  text-align: left;
}
</style>
