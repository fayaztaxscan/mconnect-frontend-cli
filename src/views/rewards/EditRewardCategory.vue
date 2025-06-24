<template>
  <div class="max-w-xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Edit Reward Category</h1>

    <div v-if="loading" class="text-center py-8">Loading…</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>

    <form
      v-else
      @submit.prevent="handleUpdate"
      class="space-y-6 bg-white p-6 rounded shadow"
    >
      <!-- Name -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          v-model="form.name"
          type="text"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          v-model="form.description"
          rows="3"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        ></textarea>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-2">
        <button
          type="button"
          @click="router.back()"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {{ loading ? 'Updating…' : 'Update Category' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  getRewardCategory,
  updateRewardCategory
} from '@/services/rewardCategories';

const route  = useRoute();
const router = useRouter();
const id      = route.params.id;

const form    = ref({ name: '', description: '' });
const loading = ref(false);
const error   = ref('');

async function load() {
  loading.value = true;
  try {
    const { data } = await getRewardCategory(id);
    form.value.name        = data.name;
    form.value.description = data.description;
  } catch {
    error.value = 'Failed to load category';
  } finally {
    loading.value = false;
  }
}

async function handleUpdate() {
  loading.value = true;
  try {
    await updateRewardCategory(id, form.value);
    router.push({ name: 'ManageRewardCategories' });
  } catch (err) {
    alert(err.response?.data?.error || 'Update failed');
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>
