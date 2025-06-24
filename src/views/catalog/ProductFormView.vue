<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-semibold mb-4">
      {{ isEditing ? 'Edit Product' : 'Create New Product' }}
    </h1>

    <form @submit.prevent="onSubmit" class="space-y-6 bg-white shadow rounded p-6">
      <div v-if="error" class="text-red-600">{{ error }}</div>

      <!-- SKU -->
      <div>
        <label for="sku" class="block text-sm font-medium text-gray-700">SKU</label>
        <input
          id="sku"
          v-model="form.sku"
          type="text"
          required
          class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

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

      <!-- Category -->
      <div>
        <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
        <select
          id="category"
          v-model="form.category_id"
          required
          class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="" disabled>Select a category</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

      <!-- Price -->
      <div>
        <label for="price" class="block text-sm font-medium text-gray-700">Price (₹)</label>
        <input
          id="price"
          v-model.number="form.price"
          type="number"
          step="0.01"
          required
          class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <!-- Stock Quantity -->
      <div>
        <label for="stock" class="block text-sm font-medium text-gray-700">Stock Quantity</label>
        <input
          id="stock"
          v-model.number="form.stock_quantity"
          type="number"
          min="0"
          required
          class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <!-- Points Required -->
      <div>
        <label for="points" class="block text-sm font-medium text-gray-700">
          Points Required
        </label>
        <input
          id="points"
          v-model.number="form.points_required"
          type="number"
          min="0"
          required
          class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <!-- Specs (JSON) -->
      <div>
        <label for="specs" class="block text-sm font-medium text-gray-700">
          Specs (as JSON)
        </label>
        <textarea
          id="specs"
          v-model="form.specsText"
          rows="4"
          placeholder='e.g. { "material":"Aluminium", "finish":"Antique" }'
          class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
        ></textarea>
        <p class="text-xs text-gray-500 mt-1">Enter a valid JSON object for item-specific attributes.</p>
      </div>

      <!-- Description -->
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          v-model="form.description"
          rows="2"
          class="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        ></textarea>
      </div>

      <div class="flex justify-end space-x-2">
        <router-link
          :to="{ name: 'ProductList' }"
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
  sku: '',
  name: '',
  category_id: null,
  price: 0.0,
  stock_quantity: 0,
  points_required: 0,
  specsText: '{}',
  description: '',
});

// Category list for <select>
const categories = ref([]);

// Fetch categories for dropdown
async function fetchCategories() {
  try {
    const { data } = await api.get('/categories');
    categories.value = data;
  } catch (e) {
    console.error('Failed to load categories:', e);
  }
}

// If editing, load the product
async function loadProduct(id) {
  try {
    const { data } = await api.get(`/products/${id}`);
    form.sku = data.sku;
    form.name = data.name;
    form.category_id = data.category_id;
    form.price = data.price;
    form.stock_quantity = data.stock_quantity;
    form.points_required = data.points_required;
    form.description = data.description || '';
    form.specsText = JSON.stringify(data.specs || {}, null, 2);
  } catch (e) {
    error.value = 'Failed to load product: ' + (e.response?.data?.message || e.message);
    console.error(e);
  }
}

// Handle Create or Update
async function onSubmit() {
  error.value = '';
  let specsJson = {};
  try {
    specsJson = JSON.parse(form.specsText);
  } catch {
    error.value = 'Specs field must be valid JSON.';
    return;
  }

  const payload = {
    sku: form.sku,
    name: form.name,
    category_id: form.category_id,
    price: form.price,
    stock_quantity: form.stock_quantity,
    points_required: form.points_required,
    specs: specsJson,
    description: form.description,
  };

  try {
    if (isEditing.value) {
      await api.put(`/products/${route.params.id}`, payload);
    } else {
      await api.post('/products', payload);
    }
    router.push({ name: 'ProductList' });
  } catch (e) {
    error.value = 'Save failed: ' + (e.response?.data?.message || e.message);
    console.error(e);
  }
}

onMounted(async () => {
  await fetchCategories();

  if (route.name === 'EditProduct') {
    isEditing.value = true;
    await loadProduct(route.params.id);
  }
});
</script>

<style scoped>
/* No extra CSS needed—Tailwind classes handle styling */
</style>
