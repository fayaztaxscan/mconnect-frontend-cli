<!-- src/views/rewards/RewardCategoriesList.vue -->
<template>
  <div class="p-4 max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Manage Reward Categories</h1>
      <router-link
        :to="{ name: 'AddRewardCategory' }"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
      >
        New Category
      </router-link>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border-collapse border border-gray-200">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2 border border-gray-200 text-left">Name</th>
            <th class="px-4 py-2 border border-gray-200 text-left">Description</th>
            <th class="px-4 py-2 border border-gray-200 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="cat in categories"
            :key="cat.id"
            class="hover:bg-gray-50"
          >
            <td class="px-4 py-2 border border-gray-200">{{ cat.name }}</td>
            <td class="px-4 py-2 border border-gray-200">{{ cat.description }}</td>
            <td class="px-4 py-2 border border-gray-200 text-right space-x-2">
              <router-link
                :to="{ name: 'ViewRewardCategory', params: { id: cat.id } }"
                class="text-blue-600 hover:underline"
              >View</router-link>
              <router-link
                v-if="cat.id !== 1"
                :to="{ name: 'EditRewardCategory', params: { id: cat.id } }"
                class="text-green-600 hover:underline"
              >Edit</router-link>
              <span
                v-else
                class="text-gray-400"
              >Edit</span>
              <button
                @click="remove(cat.id)"
                :disabled="cat.id === 1"
                :class="cat.id === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-red-600 hover:underline'"
              >Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="error" class="mt-4 text-red-500">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  getRewardCategories,
  deleteRewardCategory
} from '@/services/rewardCategories';

const categories = ref([]);
const error      = ref('');

async function fetch() {
  error.value = '';
  try {
    const res = await getRewardCategories();
    categories.value = res.data;
  } catch (e) {
    error.value = 'Failed to load categories';
  }
}

function remove(id) {
  if (!confirm('Delete this category?')) return;
  deleteRewardCategory(id).then(fetch);
}

onMounted(fetch);
</script>

<style scoped>
/* Tailwind handles the rest */
</style>
