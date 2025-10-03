<!-- src/views/rewards/EditRewardItem.vue -->
<template>
  <div class="p-4 max-w-lg mx-auto mt-8">
    <h1 class="text-2xl font-semibold mb-6">Edit Reward Item</h1>

    <div v-if="loading" class="text-center py-8">Loading…</div>
    <div v-else-if="error" class="text-red-500 mb-4">{{ error }}</div>

    <form v-else @submit.prevent="onSubmit" class="bg-white p-6 rounded-lg shadow-md space-y-4">
      <!-- Name -->
      <div>
        <label class="block mb-1 font-medium">Name</label>
        <input
          v-model="form.name"
          type="text"
          required
          class="w-full border px-3 py-2 rounded"
        />
      </div>

      <!-- Category -->
      <div>
        <label class="block mb-1 font-medium">Category</label>
        <select
          v-model.number="form.reward_category_id"
          required
          class="w-full border px-3 py-2 rounded"
        >
          <option disabled value="">-- select category --</option>
          <option
            v-for="cat in categories"
            :key="cat.id"
            :value="cat.id"
          >
            {{ cat.name }}
          </option>
        </select>
      </div>

      <!-- Points required -->
      <div>
        <label class="block mb-1 font-medium">Points Required</label>
        <input
          v-model.number="form.points_required"
          type="number"
          min="0"
          required
          class="w-full border px-3 py-2 rounded"
        />
      </div>

      <!-- MRP -->
      <div>
        <label class="block mb-1 font-medium">MRP</label>
        <input
          v-model.number="form.market_mrp"
          type="number"
          step="0.01"
          min="0"
          required
          class="w-full border px-3 py-2 rounded"
        />
      </div>

      <!-- Image -->
      <div>
        <label class="block mb-1 font-medium">Image</label>
        <div
          class="border border-dashed rounded p-4 text-center bg-white hover:bg-slate-50 cursor-pointer"
          @click="pickFile"
          @dragover.prevent
          @drop.prevent="onDrop"
        >
          <p class="text-sm text-gray-600">
            Click or drop an image (JPG/PNG/WebP/GIF, ≤ 2 MB)
          </p>
          <img
            v-if="previewUrl || itemImage"
            :src="previewUrl || itemImage"
            alt="Current or preview image"
            class="mx-auto mt-3 h-24 object-contain"
          />
          <p v-if="itemImage && !previewUrl" class="text-xs text-gray-500 mt-1">Current image</p>
        </div>
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          accept="image/*"
          @change="onFileChange"
        />
        <p v-if="imageError" class="text-xs text-red-600 mt-1">{{ imageError }}</p>
      </div>

      <!-- Stock -->
      <div>
        <label class="block mb-1 font-medium">Available Stock</label>
        <input
          v-model.number="form.available_stock"
          type="number"
          min="0"
          required
          class="w-full border px-3 py-2 rounded"
        />
      </div>

      <!-- Status -->
      <div>
        <label class="block mb-1 font-medium">Status</label>
        <select
          v-model="form.status"
          required
          class="w-full border px-3 py-2 rounded"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-3 pt-4 border-t">
        <router-link
          :to="{ name: 'ViewRewardItem', params: { id } }"
          class="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Cancel
        </router-link>
        <button
          type="submit"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          :disabled="saving"
        >
          {{ saving ? 'Saving…' : 'Save Changes' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  getRewardItem,
  updateRewardItem,
  uploadRewardImage,
} from '@/services/rewardItems';
import { getRewardCategories } from '@/services/rewardCategories';

const route = useRoute();
const router = useRouter();
const id     = +route.params.id;

const loading    = ref(false);
const saving     = ref(false);
const error      = ref('');
const categories = ref([]);
const form = ref({
  name: '',
  reward_category_id: null,
  points_required: 0,
  market_mrp: 0,
  available_stock: 0,
  status: 'active',
});

// image state
const itemImage  = ref('');      // current image_url from API
const fileInput  = ref(null);
const file       = ref(null);
const previewUrl = ref('');
const imageError = ref('');

// image helpers
function pickFile() {
  fileInput.value?.click();
}
function onDrop(e) {
  const f = e.dataTransfer?.files?.[0];
  if (f) loadFile(f);
}
function onFileChange(e) {
  const f = e.target?.files?.[0];
  if (f) loadFile(f);
}
function loadFile(f) {
  imageError.value = '';
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(f.type)) {
    imageError.value = 'Only JPG, PNG, WebP, or GIF images are allowed.';
    return;
  }
  if (f.size > 2 * 1024 * 1024) {
    imageError.value = 'Image must be 2 MB or smaller.';
    return;
  }
  file.value = f;
  previewUrl.value = URL.createObjectURL(f);
}

async function fetchData() {
  loading.value = true;
  try {
    const [{ data: itemData }, { data: cats }] = await Promise.all([
      getRewardItem(id),
      getRewardCategories()
    ]);

    Object.assign(form.value, {
      name: itemData.name,
      reward_category_id: itemData.reward_category_id,
      points_required: itemData.points_required,
      market_mrp: itemData.market_mrp,
      available_stock: itemData.available_stock,
      status: itemData.status
    });

    itemImage.value = itemData.image_url || '';
    categories.value = cats;
  } catch (e) {
    error.value = 'Failed to load reward item or categories.';
  } finally {
    loading.value = false;
  }
}

async function onSubmit() {
  if (imageError.value) return; // block if invalid image chosen
  saving.value = true;
  error.value  = '';
  try {
    await updateRewardItem(id, form.value);
    if (file.value) {
      try {
        await uploadRewardImage(id, file.value);
      } catch (upErr) {
        console.warn('Image upload failed:', upErr);
      }
    }
    router.push({ name: 'ViewRewardItem', params: { id } });
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save changes.';
  } finally {
    saving.value = false;
  }
}

onMounted(fetchData);
</script>

<style scoped>
/* All styling via Tailwind utilities */
</style>
