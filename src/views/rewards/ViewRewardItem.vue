<template>
  <div class="p-4 max-w-md mx-auto mt-8">
    <h1 class="text-2xl font-semibold mb-4">Reward Item Details</h1>

    <div v-if="loading" class="text-center py-8">Loading…</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else-if="item && categories.length" class="space-y-2 bg-white p-6 rounded-lg shadow-md">
      <p><strong>Name:</strong> {{ item.name }}</p>
      <p><strong>Category:</strong> {{ getCategoryName() }}</p>
      <p><strong>Points Required:</strong> {{ item.points_required }}</p>
      <p><strong>MRP:</strong> {{ Number(item.market_mrp).toFixed(2) }}</p>
      <p><strong>Available Stock:</strong> {{ item.available_stock }}</p>
      <p><strong>Status:</strong> {{ item.status }}</p>
      <p><strong>Created At:</strong> {{ formatDate(item.created_at) }}</p>
      <p><strong>Updated At:</strong> {{ formatDate(item.updated_at) }}</p>

      <div class="mt-6 flex space-x-3 justify-end">
        <router-link
          :to="{ name: 'EditRewardItem', params: { id: item.id } }"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Edit
        </router-link>
        <router-link
          :to="{ name: 'ManageRewardItems' }"
          class="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Back
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getRewardItem } from '@/services/rewardItems';
import { getRewardCategories } from '@/services/rewardCategories';

const route = useRoute();
const id = route.params.id;

const item = ref(null);
const categories = ref([]);
const loading = ref(true);
const error = ref('');

function formatDate(ts) {
  return ts ? new Date(ts).toLocaleString() : '—';
}

function getCategoryName() {
  const cat = categories.value.find(c => c.id === item.value.reward_category_id);
  return cat?.name ?? '—';
}

async function fetchData() {
  loading.value = true;
  try {
    const [{ data: itemData }, { data: cats }] = await Promise.all([
      getRewardItem(id),
      getRewardCategories()
    ]);
    item.value = itemData;
    categories.value = cats;
  } catch (err) {
    error.value = 'Failed to load reward item or categories.';
  } finally {
    loading.value = false;
  }
}

onMounted(fetchData);
</script>

<style scoped>
/* Styling via Tailwind utilities */
</style>
