<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-semibold">Category Management</h1>
      <!-- “Add New Category” button lives on this page -->
      <router-link
        :to="{ name: 'CreateCategory' }"
        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        + New Category
      </router-link>
    </div>

    <table class="min-w-full bg-white border">
      <thead class="bg-gray-100">
        <tr>
          <th class="px-4 py-2 border">Name</th>
          <th class="px-4 py-2 border">Parent</th>
          <th class="px-4 py-2 border">Min Sales Threshold</th>
          <th class="px-4 py-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cat in categories" :key="cat.id" class="hover:bg-gray-50">
          <td class="px-4 py-2 border">{{ cat.name }}</td>
          <td class="px-4 py-2 border">
            {{ parentMap[cat.parent_id] || '—' }}
          </td>
          <td class="px-4 py-2 border">₹{{ cat.min_sales_threshold.toFixed(2) }}</td>
          <td class="px-4 py-2 border">
            <router-link
              :to="{ name: 'EditCategory', params: { id: cat.id } }"
              class="text-indigo-600 hover:underline"
            >
              Edit
            </router-link>
          </td>
        </tr>
        <tr v-if="!categories.length">
          <td colspan="4" class="text-center py-4 text-gray-500">
            No categories found.
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="error" class="mt-4 text-red-600">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';

const categories = ref([]);
const error = ref('');

// Fetch all categories from GET /api/categories
async function fetchCategories() {
  error.value = '';
  try {
    const { data } = await api.get('/categories');
    categories.value = data;
  } catch (e) {
    error.value = 'Failed to load categories: ' + (e.response?.data?.message || e.message);
    console.error(e);
  }
}

// Build a map of parent_id → parent_name for display
const parentMap = computed(() => {
  const map = {};
  categories.value.forEach((c) => {
    map[c.id] = c.name;
  });
  return map;
});

onMounted(fetchCategories);
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
