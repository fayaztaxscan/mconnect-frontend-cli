<template>
  <div class="p-4 max-w-4xl mx-auto mt-8">
    <!-- Header with title and New Item button -->
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-semibold">Manage Reward Items</h1>
      <router-link
        :to="{ name: 'CreateRewardItem' }"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
      >
        New Item
      </router-link>
    </div>

    <!-- Region-switching banner -->
    <div
      v-if="regionSwitching"
      class="mb-3 px-4 py-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm flex items-center gap-2"
    >
      <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
      Updating prices for {{ regionStore.selectedRegion?.name || 'selected region' }}…
    </div>

    <!-- Table of items -->
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-4 py-2 border border-gray-200 text-center w-16">Image</th>
            <th class="px-4 py-2 border border-gray-200 text-left">Name</th>
            <th class="px-4 py-2 border border-gray-200 text-left">Category</th>
            <th class="px-4 py-2 border border-gray-200 text-right">Points</th>
            <th class="px-4 py-2 border border-gray-200 text-right">MRP</th>
            <th class="px-4 py-2 border border-gray-200 text-right">Stock</th>
            <th class="px-4 py-2 border border-gray-200 text-center">Status</th>
            <th class="px-4 py-2 border border-gray-200 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50">
            <td class="px-4 py-2 border border-gray-200 text-center">
              <div class="h-10 w-10 mx-auto flex items-center justify-center">
                <img
                  v-if="item.image_url"
                  :src="item.image_url"
                  :alt="item.name"
                  class="h-10 w-10 object-contain"
                  loading="lazy"
                  @error="onImgError"
                />
                <img
                  v-else
                  src="/placeholder-product.png"
                  alt=""
                  class="h-10 w-10 object-contain opacity-70"
                  loading="lazy"
                />
              </div>
            </td>
            <td class="px-4 py-2 border border-gray-200">{{ item.name }}</td>
            <td class="px-4 py-2 border border-gray-200">{{ item.reward_category_name }}</td>
            <td class="px-4 py-2 border border-gray-200 text-right">{{ item.points_required }}</td>
            <td class="px-4 py-2 border border-gray-200 text-right">{{ Number(item.market_mrp).toFixed(2) }}</td>
            <td class="px-4 py-2 border border-gray-200 text-right">{{ item.available_stock }}</td>
            <td class="px-4 py-2 border border-gray-200 text-center">
              <span :class="item.status === 'active' ? 'text-green-600' : 'text-red-600'">
                {{ item.status }}
              </span>
            </td>
            <td class="px-4 py-2 border border-gray-200 text-right space-x-2">
              <router-link
                :to="{ name: 'ViewRewardItem', params: { id: item.id } }"
                class="text-blue-600 hover:underline"
              >View</router-link>
              <button
                @click="edit(item.id)"
                class="text-green-600 hover:underline"
              >Edit</button>
              <button
                @click="removeItem(item.id)"
                class="text-red-600 hover:underline"
              >Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Error message -->
    <div v-if="error" class="text-red-500 mt-4">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getRewardItems, deleteRewardItem } from '@/services/rewardItems';
import { useRegionStore } from '@/store/regionStore';

const regionStore = useRegionStore();
const regionSwitching = ref(false);

watch(
  () => regionStore.selectedRegionId,
  async (newId, oldId) => {
    if (newId === oldId) return
    regionSwitching.value = true
    try {
      await fetchItems()
    } finally {
      regionSwitching.value = false
    }
  }
);

const items = ref([]);
const error = ref('');
const router = useRouter();

// Fetch list of reward items
async function fetchItems() {
  try {
    const res = await getRewardItems();
    items.value = res.data;
  } catch (e) {
    error.value = 'Failed to load reward items';
  }
}

// Navigation handlers
function edit(id) {
  router.push({ name: 'EditRewardItem', params: { id } });
}
function removeItem(id) {
  if (!confirm('Delete this reward item?')) return;
  deleteRewardItem(id).then(fetchItems);
}

// Make sure onerror doesn't loop; swap to placeholder once
function onImgError(e) {
  const img = e.target;
  if (!img || img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = '1';
  img.src = '/placeholder-product.png';
  img.classList.add('opacity-70');
}

onMounted(fetchItems);
</script>

<style scoped>
/* All styling via Tailwind utilities */
</style>
