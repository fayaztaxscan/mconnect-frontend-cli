<template>
  <div class="p-4 max-w-lg">
    <h1 class="text-2xl font-semibold mb-4">
      {{ isEdit ? 'Edit' : 'New' }} Reward Item
    </h1>
    <form @submit.prevent="submit">
      <div class="mb-4">
        <label class="block mb-1">Name</label>
        <input v-model="form.name" required class="w-full border px-3 py-2" />
      </div>

      <div class="mb-4">
        <label class="block mb-1">Category</label>
        <select v-model="form.reward_category_id" required class="w-full border px-3 py-2">
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <div class="mb-4 flex space-x-4">
        <div class="flex-1">
          <label class="block mb-1">Points Required</label>
          <input
            type="number"
            v-model.number="form.points_required"
            min="0"
            required
            class="w-full border px-3 py-2"
          />
        </div>
        <div class="flex-1">
          <label class="block mb-1">Market MRP</label>
          <input
            type="number"
            step="0.01"
            v-model.number="form.market_mrp"
            min="0"
            required
            class="w-full border px-3 py-2"
          />
        </div>
      </div>

      <div class="mb-4">
        <label class="block mb-1">Available Stock</label>
        <input
          type="number"
          v-model.number="form.available_stock"
          min="0"
          required
          class="w-full border px-3 py-2"
        />
      </div>

      <div class="mb-6">
        <label class="inline-flex items-center">
          <input type="checkbox" v-model="form.status" true-value="active" false-value="inactive" />
          <span class="ml-2">Active</span>
        </label>
      </div>

      <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded">
        {{ isEdit ? 'Update' : 'Create' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  getRewardCategories
} from '@/services/rewardCategories';
import {
  createRewardItem,
  updateRewardItem,
  getRewardItem
} from '@/services/rewardItems';

const route    = useRoute();
const router   = useRouter();
const id       = route.params.id;
const isEdit   = Boolean(id);

const categories = ref([]);
const form = ref({
  name: '',
  reward_category_id: null,
  points_required: 0,
  market_mrp: 0.0,
  available_stock: 0,
  status: 'active'
});

async function loadCategories() {
  const res = await getRewardCategories();
  categories.value = res.data;
}

async function loadItem() {
  if (!isEdit) return;
  const res = await getRewardItem(id);
  Object.assign(form.value, {
    name: res.data.name,
    reward_category_id: res.data.reward_category_id,
    points_required: res.data.points_required,
    market_mrp: res.data.market_mrp,
    available_stock: res.data.available_stock,
    status: res.data.status
  });
}

async function submit() {
  try {
    if (isEdit) {
      await updateRewardItem(id, form.value);
    } else {
      await createRewardItem(form.value);
    }
    router.push({ name: 'ManageRewardItems' });
  } catch (err) {
    alert(err.response?.data?.error || 'An error occurred');
  }
}

onMounted(async () => {
  await loadCategories();
  await loadItem();
});
</script>
