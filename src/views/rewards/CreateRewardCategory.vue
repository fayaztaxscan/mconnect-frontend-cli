<template>
  <div class="max-w-xl mx-auto p-4">
    <h2 class="text-xl font-bold mb-4">Add Reward Category</h2>

    <form @submit.prevent="handleSubmit" class="space-y-6 bg-white p-6 rounded shadow">
      <!-- Name -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          v-model="form.name"
          type="text"
          placeholder="Category Name"
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
          placeholder="Optional description"
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
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
        >
          Create Category
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { createRewardCategory } from '@/services/rewardCategories';

const router = useRouter();
const form = ref({ name: '', description: '' });

async function handleSubmit() {
  try {
    await createRewardCategory(form.value);
    router.push({ name: 'ManageRewardCategories' });
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to create category');
  }
}
</script>

<style scoped>
/* Tailwind handles styling */
</style>
