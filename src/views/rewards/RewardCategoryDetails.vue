<template>
  <div class="p-4 max-w-md mx-auto mt-8">
    <h1 class="text-2xl font-semibold mb-4">Reward Category Details</h1>

    <div v-if="loading" class="text-center py-8">Loading…</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>

    <div v-else class="space-y-2 bg-white p-6 rounded-lg shadow-md">
      <p><strong>Name:</strong> {{ category.name }}</p>
      <p><strong>Description:</strong> {{ category.description || '—' }}</p>
      <p><strong>Created At:</strong> {{ formatDate(category.created_at) }}</p>
      <p><strong>Updated At:</strong> {{ formatDate(category.updated_at) }}</p>
    </div>

    <div class="mt-6 flex space-x-3 justify-end">
      <router-link
        v-if="category.id"
        :to="{ name: 'EditRewardCategory', params: { id: category.id } }"
        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        Edit
      </router-link>
      <router-link
        :to="{ name: 'ManageRewardCategories' }"
        class="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
      >
        Back
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getRewardCategory } from '@/services/rewardCategories';

const route    = useRoute();
const id       = route.params.id;
const category = ref({});
const loading  = ref(false);
const error    = ref('');

function formatDate(ts) {
  return ts ? new Date(ts).toLocaleString() : '—';
}

async function fetchCategory() {
  loading.value = true;
  error.value   = '';
  try {
    const { data } = await getRewardCategory(id);
    category.value = data;
  } catch (e) {
    error.value = 'Failed to load category';
  } finally {
    loading.value = false;
  }
}

onMounted(fetchCategory);
</script>

<style scoped>
/* All styling via Tailwind utilities */
</style>
