<template>
  <div class="p-4 max-w-lg mx-auto mt-8">
    <h1 class="text-2xl font-semibold mb-6">New Reward Item</h1>

    <div v-if="loading" class="text-center py-8">Loading categories…</div>
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

      <!-- Points Required -->
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
            v-if="previewUrl"
            :src="previewUrl"
            alt="Preview"
            class="mx-auto mt-3 h-24 object-contain"
          />
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

      <!-- Available Stock -->
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

      <!-- Regional Points & Pricing -->
      <div class="border rounded-lg overflow-hidden">
        <button
          type="button"
          @click="pricingOpen = !pricingOpen"
          class="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700"
        >
          <span>Regional Points &amp; Pricing</span>
          <svg
            :class="pricingOpen ? 'rotate-180' : ''"
            class="w-4 h-4 transition-transform"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div v-if="pricingOpen" class="p-4">
          <div v-if="pricingLoading" class="text-sm text-gray-500">Loading regions…</div>
          <div v-else-if="!regionalConfig.length" class="text-sm text-gray-400">No regions found.</div>
          <div v-else class="space-y-3">
            <div
              v-for="row in regionalConfig"
              :key="row.region_id"
              class="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg border"
            >
              <div class="col-span-2 md:col-span-1 flex flex-col justify-center">
                <span class="font-medium text-sm text-gray-800">{{ row.region_name }}</span>
                <span class="text-xs text-gray-400">{{ row.currency_code }}</span>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">Points Required</label>
                <input
                  v-model.number="row.points_required"
                  type="number" min="0" step="1"
                  class="w-full border rounded px-2 py-1.5 text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">Market MRP</label>
                <div class="relative">
                  <span class="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">{{ row.currency_symbol || row.currency_code }}</span>
                  <input
                    v-model.number="row.market_mrp"
                    type="number" min="0" step="0.01"
                    class="w-full border rounded px-2 py-1.5 pl-10 text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div class="flex items-end pb-1">
                <label class="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input type="checkbox" v-model="row.is_active" :true-value="1" :false-value="0" class="rounded" />
                  <span :class="row.is_active ? 'text-green-600' : 'text-gray-400'">
                    {{ row.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </label>
              </div>
            </div>
          </div>
          <div v-if="pricingSaveError" class="mt-2 text-xs text-amber-600">{{ pricingSaveError }}</div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-3 pt-4 border-t">
        <router-link
          :to="{ name: 'ManageRewardItems' }"
          class="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >Cancel</router-link>
        <button
          type="submit"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
          :disabled="saving"
        >
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </div>
      <p v-if="saving && file" class="text-sm text-slate-600 text-right mt-2">
        Saving item and uploading image, please wait…
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { createRewardItem, uploadRewardImage } from '@/services/rewardItems';
import { getRewardCategories } from '@/services/rewardCategories';
import api from '@/services/api';
import { useRegions } from '@/composables/useRegions';

const router = useRouter();
const { regions, fetchRegions } = useRegions();
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const categories = ref([]);

const pricingOpen = ref(false);
const pricingLoading = ref(false);
const pricingSaveError = ref('');
const regionalConfig = ref([]);

watch(pricingOpen, async (open) => {
  if (open && !regionalConfig.value.length) {
    pricingLoading.value = true;
    try {
      await fetchRegions();
      regionalConfig.value = regions.value.map(r => ({
        region_id: r.id,
        region_name: r.name,
        currency_code: r.currency_code,
        currency_symbol: r.currency_symbol,
        points_required: null,
        market_mrp: null,
        is_active: 1
      }));
    } finally {
      pricingLoading.value = false;
    }
  }
});

const form = ref({
  name: '',
  reward_category_id: null,
  points_required: 0,
  market_mrp: 0,
  available_stock: 0,
  status: 'active',
});

const fileInput = ref(null);
const file = ref(null);
const previewUrl = ref('');
const imageError = ref('');

// helpers for image picking
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
  // basic client-side validation to match backend (≤ 2 MB & allowed mime)
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

// Load categories on mount
async function fetchCategories() {
  loading.value = true;
  try {
    const { data } = await getRewardCategories();
    categories.value = data;
  } catch (e) {
    error.value = 'Failed to load categories.';
  } finally {
    loading.value = false;
  }
}

// Handle form submit
async function onSubmit() {
  if (imageError.value) return; // block submit if image invalid
  saving.value = true;
  error.value = '';
  try {
    const { data } = await createRewardItem(form.value);
    // if an image was selected, upload it now
    if (file.value) {
      try {
        await uploadRewardImage(data.id, file.value);
      } catch (upErr) {
        // don't block navigation; just surface a gentle message
        console.warn('Image upload failed:', upErr);
      }
    }
    if (pricingOpen.value && data?.id) {
      const rows = regionalConfig.value
        .filter(r => r.points_required !== null && r.points_required !== '')
        .map(r => ({
          region_id: r.region_id,
          points_required: Number(r.points_required),
          market_mrp: r.market_mrp !== null && r.market_mrp !== '' ? Number(r.market_mrp) : 0,
          is_active: r.is_active ? 1 : 0
        }));
      if (rows.length) {
        try {
          await api.put(`/reward-items/${data.id}/regional-config`, { config: rows });
        } catch (pe) {
          pricingSaveError.value = 'Regional config save failed: ' + (pe.response?.data?.message || pe.message);
        }
      }
    }
    router.push({ name: 'ViewRewardItem', params: { id: data.id } });
  } catch (e) {
    error.value = e?.response?.data?.error || 'Failed to create item.';
  } finally {
    saving.value = false;
  }
}

onMounted(fetchCategories);
</script>

<style scoped>
/* All styling via Tailwind utilities */
</style>
