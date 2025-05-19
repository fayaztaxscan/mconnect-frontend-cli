<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-semibold">Manage Reward Items</h1>
      <router-link
        :to="{ name: 'CreateRewardItem' }"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
      >
        New Reward Item
      </router-link>
    </div>

    <div v-if="loading" class="text-center">Loading...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>

    <table v-else class="min-w-full bg-white divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left">ID</th>
          <th class="px-6 py-3 text-left">Name</th>
          <th class="px-6 py-3 text-left">Category</th>
          <th class="px-6 py-3 text-right">Points</th>
          <th class="px-6 py-3 text-right">MRP</th>
          <th class="px-6 py-3 text-right">Stock</th>
          <th class="px-6 py-3 text-center">Status</th>
          <th class="px-6 py-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id">
          <td class="px-6 py-4">{{ item.id }}</td>
          <td class="px-6 py-4">{{ item.name }}</td>
          <td class="px-6 py-4">{{ item.reward_category_name }}</td>
          <td class="px-6 py-4 text-right">{{ item.points_required }}</td>
          <td class="px-6 py-4 text-right">
            {{ Number(item.market_mrp).toFixed(2) }}
          </td>
          <td class="px-6 py-4 text-right">{{ item.available_stock }}</td>
          <td class="px-6 py-4 text-center">
            <span :class="item.status === 'active' ? 'text-green-600' : 'text-red-600'">
              {{ item.status }}
            </span>
          </td>
          <td class="px-6 py-4 text-right space-x-2">
            <button
              @click="edit(item.id)"
              class="px-2"
            >
              Edit
            </button>
            <button
              @click="remove(item.id)"
              class="ml-2 px-2 text-red-600 hover:text-red-900"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  getRewardItems,
  deleteRewardItem
} from '@/services/rewardItems';

const items   = ref([]);
const loading = ref(false);
const error   = ref('');
const router  = useRouter();

async function fetchItems() {
  loading.value = true;
  try {
    const res = await getRewardItems();
    items.value = res.data;
  } catch (e) {
    error.value = 'Failed to load reward items';
  } finally {
    loading.value = false;
  }
}

function edit(id) {
  router.push({ name: 'EditRewardItem', params: { id } });
}

function remove(id) {
  if (!confirm('Delete this reward item?')) return;
  deleteRewardItem(id).then(fetchItems);
}

onMounted(fetchItems);
</script>
