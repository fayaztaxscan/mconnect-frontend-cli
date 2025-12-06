<template>
  <div class="p-4 max-w-md mx-auto mt-8">
    <h1 class="text-2xl font-semibold mb-4">Reward Item Details</h1>

    <div v-if="loading" class="text-center py-8">Loading…</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>

    <div v-else-if="item" class="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <!-- Image -->
      <div class="flex justify-center">
        <img
          :src="item.image_url || '/placeholder-product.png'"
          alt="Reward image"
          class="h-32 w-auto object-contain border rounded p-2 bg-white"
          loading="lazy"
          @error="onImgError"
        />
      </div>

      <!-- Fields -->
      <div class="space-y-2">
        <p><strong>Name:</strong> {{ item.name }}</p>
        <p><strong>Category:</strong> {{ resolvedCategoryName }}</p>
        <p><strong>Points Required:</strong> {{ item.points_required }}</p>
        <p><strong>MRP:</strong> {{ Number(item.market_mrp).toFixed(2) }}</p>
        <p><strong>Available Stock:</strong> {{ item.available_stock }}</p>
        <p><strong>Status:</strong> {{ item.status }}</p>
        <p><strong>Created At:</strong> {{ formatDate(item.created_at) }}</p>
        <p><strong>Updated At:</strong> {{ formatDate(item.updated_at) }}</p>
      </div>

      <!-- Actions -->
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
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getRewardItem } from '@/services/rewardItems';
import { getRewardCategories } from '@/services/rewardCategories';

const route = useRoute();
const id = route.params.id;

const item = ref(null);
const categories = ref([]);
const loading = ref(true);
const error = ref('');

// Prefer API-provided reward_category_name; else look up from categories list
const resolvedCategoryName = computed(() => {
  if (!item.value) return '—';
  if (item.value.reward_category_name) return item.value.reward_category_name;
  const c = categories.value.find(c => c.id === item.value.reward_category_id);
  return c?.name ?? '—';
});

function formatDate(ts) {
  return ts ? new Date(ts).toLocaleString() : '—';
}

// ensure onerror doesn’t loop; swap to placeholder once
function onImgError(e) {
  const img = e.target;
  if (!img || img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = '1';
  img.src = '/placeholder-product.png';
  img.classList.add('opacity-70');
}

async function fetchData() {
  loading.value = true;
  try {
    // Don’t fail the page if categories fail; item is sufficient
    const [itemRes, catsRes] = await Promise.allSettled([
      getRewardItem(id),
      getRewardCategories()
    ]);

    if (itemRes.status === 'fulfilled' && itemRes.value?.data) {
      item.value = itemRes.value.data;
    } else {
      throw new Error('Item not found');
    }

    if (catsRes.status === 'fulfilled') {
      categories.value = catsRes.value.data || [];
    } else {
      categories.value = []; // fine; we'll still render using reward_category_name
    }
  } catch (_e) {
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
