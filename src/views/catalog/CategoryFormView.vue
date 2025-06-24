<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-semibold mb-4">
      {{ isEditing ? 'Edit Category' : 'Create New Category' }}
    </h1>

    <form @submit.prevent="onSubmit" class="space-y-6 bg-white shadow rounded p-6">
      <div v-if="error" class="text-red-600">{{ error }}</div>

      <!-- Name -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <!-- Parent Category -->
      <div>
        <label for="parent" class="block text-sm font-medium text-gray-700">Parent Category</label>
        <select
          id="parent"
          v-model="form.parent_id"
          class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option :value="null">— None —</option>
          <option
            v-for="c in categories"
            :key="c.id"
            :value="c.id"
            v-if="!isEditing || c.id !== Number(route.params.id)"
          >
            {{ c.name }}
          </option>
        </select>
        <p class="text-xs text-gray-500 mt-1">
          Choose a parent to create a subcategory; leave blank for top-level.
        </p>
      </div>

      <!-- Min Sales Threshold -->
      <div>
        <label for="threshold" class="block text-sm font-medium text-gray-700">
          Min Sales Threshold (₹)
        </label>
        <input
          id="threshold"
          v-model.number="form.min_sales_threshold"
          type="number"
          step="0.01"
          required
          class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <!-- Description -->
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          v-model="form.description"
          rows="3"
          class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        ></textarea>
      </div>

      <div class="flex justify-end space-x-2">
        <router-link
          :to="{ name: 'CategoryList' }"
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </router-link>
        <button
          type="submit"
          class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {{ isEditing ? 'Update' : 'Create' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/services/api';

const router = useRouter();
const route = useRoute();
const isEditing = ref(false);
const error = ref('');

// Form state
const form = reactive({
  name: '',
  parent_id: null,
  min_sales_threshold: 0.0,
  description: '',
});

// List of categories to populate the “Parent” dropdown
const categories = ref([]);

// Fetch all categories for dropdown
async function fetchCategories() {
  try {
    const { data } = await api.get('/categories');
    categories.value = data;
  } catch (e) {
    console.error('Failed to load categories:', e);
  }
}

// If editing, load existing category into form
async function loadCategory(id) {
  try {
    const { data } = await api.get(`/categories/${id}`);
    form.name = data.name;
    form.parent_id = data.parent_id;
    form.min_sales_threshold = data.min_sales_threshold;
    form.description = data.description || '';
  } catch (e) {
    error.value = 'Failed to load category: ' + (e.response?.data?.message || e.message);
    console.error(e);
  }
}

// Handle create/update
async function onSubmit() {
  error.value = '';
  const payload = {
    name: form.name,
    parent_id: form.parent_id,
    min_sales_threshold: form.min_sales_threshold,
    description: form.description,
  };

  try {
    if (isEditing.value) {
      await api.put(`/categories/${route.params.id}`, payload);
    } else {
      await api.post('/categories', payload);
    }
    router.push({ name: 'CategoryList' });
  } catch (e) {
    error.value = 'Save failed: ' + (e.response?.data?.message || e.message);
    console.error(e);
  }
}

onMounted(async () => {
  await fetchCategories();

  if (route.name === 'EditCategory') {
    isEditing.value = true;
    await loadCategory(route.params.id);
  }
});
</script>

<style scoped>
/* Tailwind utility classes suffice */
</style>
