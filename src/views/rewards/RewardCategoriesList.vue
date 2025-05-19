<!-- src/views/rewards/RewardCategoriesList.vue -->
<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-semibold">Manage Reward Categories</h1>
      <router-link
        :to="{ name: 'CreateRewardCategory' }"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
      >
        New Category
      </router-link>
    </div>

    <div v-if="loading" class="text-center">Loading...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>

    <table v-else class="min-w-full bg-white divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left">ID</th>
          <th class="px-6 py-3 text-left">Name</th>
          <th class="px-6 py-3 text-left">Description</th>
          <th class="px-6 py-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cat in categories" :key="cat.id">
          <td class="px-6 py-4">{{ cat.id }}</td>
          <td class="px-6 py-4">{{ cat.name }}</td>
          <td class="px-6 py-4">{{ cat.description }}</td>
          <td class="px-6 py-4 text-right">
                <button
                    @click="edit(cat.id)"
                    :disabled="cat.id === 1"
                    :class="[
                    'px-2',
                    cat.id === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-indigo-600 hover:text-indigo-900'
                    ]"
                >
                    Edit
            </button>
            <button
                @click="remove(cat.id)"
                :disabled="cat.id === 1"
                :class="[
                'ml-4 px-2',
                cat.id === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-red-600 hover:text-red-900'
                ]"
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
  getRewardCategories,
  deleteRewardCategory
} from '@/services/rewardCategories';

const categories = ref([]);
const loading    = ref(false);
const error      = ref('');
const router     = useRouter();

async function fetch() {
  loading.value = true;
  try {
    const res = await getRewardCategories();
    categories.value = res.data;
  } catch (e) {
    error.value = 'Failed to load categories';
  } finally {
    loading.value = false;
  }
}

function edit(id) {
  router.push({ name: 'EditRewardCategory', params: { id } });
}

function remove(id) {
  if (!confirm('Delete this category?')) return;
  deleteRewardCategory(id).then(fetch);
}

onMounted(fetch);
</script>
