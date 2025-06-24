<template>
  <div class="max-w-4xl mx-auto p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Manage Reward Items</h1>
      <router-link
        :to="{ name: 'CreateRewardItem' }"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
      >
        New Reward Item
      </router-link>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-100">
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
          <tr
            v-for="item in items"
            :key="item.id"
            class="hover:bg-gray-50"
          >
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
                @click="remove(item.id)"
                class="text-red-600 hover:underline"
              >Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="error" class="text-red-500 mt-4">{{ error }}</div>
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
const error   = ref('');
const router  = useRouter();

async function fetchItems() {
  try {
    const res = await getRewardItems();
    items.value = res.data;
  } catch (e) {
    error.value = 'Failed to load reward items';
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
