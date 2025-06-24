<template>
  <div class="max-w-xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Edit User</h1>

    <div v-if="loading" class="text-center py-8">Loading…</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>

    <form
      v-else
      @submit.prevent="handleUpdate"
      class="space-y-6 bg-white p-6 rounded shadow"
    >
      <!-- Display Name -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
        <input
          v-model="form.display_name"
          type="text"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <!-- Email -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          v-model="form.email"
          type="email"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <!-- Phone -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          v-model="form.phone"
          type="tel"
          placeholder="e.g. 9876543210"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <!-- Preferred Language -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
        <select
          v-model="form.preferred_language"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option disabled value="">Select Language</option>
          <option
            v-for="lang in languages"
            :key="lang.code"
            :value="lang.code"
          >
            {{ lang.name }}
          </option>
        </select>
      </div>

      <!-- Password -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Password (leave blank to keep current)
        </label>
        <input
          v-model="form.password"
          type="password"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <!-- Role -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <select
          v-model="form.role_id"
          @change="onRoleChange"
          :disabled="isCSR"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option disabled value="">Select Role</option>
          <option
            v-for="r in roles"
            :key="r.id"
            :value="r.id"
          >
            {{ r.name }}
          </option>
        </select>
      </div>

      <!-- Region -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Region</label>
        <select
          v-model="form.region_id"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option disabled value="">Select Region</option>
          <option
            v-for="rg in regions"
            :key="rg.id"
            :value="rg.id"
          >
            {{ rg.name }}
          </option>
        </select>
      </div>

      <!-- Retail Staff shop -->
      <div v-if="isRetailStaff">
        <label class="block text-sm font-medium text-gray-700 mb-1">Shop</label>
        <select
          v-model="form.shop_id"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option disabled value="">Select Shop</option>
          <option
            v-for="s in shops"
            :key="s.id"
            :value="s.id"
          >
            {{ s.name }}
          </option>
        </select>
      </div>

      <!-- CSR-only fields -->
      <div v-if="isCSR" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Brand</label>
          <select
            v-model="form.brand_id"
            @change="fetchDivisions"
            class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option disabled value="">Select Brand</option>
            <option v-for="b in brands" :key="b.id" :value="b.id">
              {{ b.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Division</label>
          <select
            v-model="form.division_id"
            class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option disabled value="">Select Division</option>
            <option v-for="d in divisions" :key="d.id" :value="d.id">
              {{ d.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Dealer</label>
          <select
            v-model="form.dealer_id"
            class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option disabled value="">Select Dealer</option>
            <option v-for="d in dealers" :key="d.id" :value="d.id">
              {{ d.name }} ({{ d.dealer_code }})
            </option>
          </select>
        </div>

        <!-- Multi-shop picker -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Assign Shops</label>
          <select
            v-model="form.shop_ids"
            multiple
            class="w-full h-32 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option v-for="s in shops" :key="s.id" :value="s.id">
              {{ s.name }} ({{ s.shop_code }})
            </option>
          </select>
          <p class="text-xs text-gray-500 mt-1">
            Hold Ctrl (Windows) or ⌘ (Mac) to select multiple.
          </p>
        </div>
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
          {{ loading ? 'Updating…' : 'Update User' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';

const route  = useRoute();
const router = useRouter();
const id      = route.params.id;

const loading   = ref(false);
const error     = ref('');
const roles     = ref([]);
const regions   = ref([]);
const shops     = ref([]);
const dealers   = ref([]);
const languages = ref([]);
const brands    = ref([]);
const divisions = ref([]);

const form = ref({
  display_name:       '',
  email:              '',
  phone:              '',
  preferred_language: '',
  password:           '',
  role_id:            null,
  region_id:          null,
  shop_id:            null,
  brand_id:           null,
  division_id:        null,
  dealer_id:          null,
  shop_ids:           []
});

const selectedRoleName = computed(() =>
  roles.value.find(r => r.id === form.value.role_id)?.name || ''
);
const isCSR         = computed(() => selectedRoleName.value === 'CSR');
const isRetailStaff = computed(() => selectedRoleName.value === 'Retail Staff');

onMounted(async () => {
  loading.value = true;
  try {
    const [
      rRoles, rRegions, rShops, rDealers, rLangs, rBrands, rDivs, userRes
    ] = await Promise.all([
      api.get('/roles'),
      api.get('/regions'),
      api.get('/shops'),
      api.get('/dealers'),
      api.get('/localization/languages'),
      api.get('/brands'),
      api.get('/divisions'),
      api.get(`/users/${id}`)
    ]);

    roles.value     = rRoles.data;
    regions.value   = rRegions.data;
    shops.value     = rShops.data;
    dealers.value   = rDealers.data;
    languages.value = rLangs.data;
    brands.value    = rBrands.data;
    divisions.value = rDivs.data;

    const u = userRes.data;
    form.value = {
      display_name:       u.display_name,
      email:              u.email,
      phone:              u.phone,
      preferred_language: u.preferred_language,
      password:           '',
      role_id:            u.role_id,
      region_id:          u.region_id,
      shop_id:            u.retail_shop_id || null,
      brand_id:           u.brand_id,
      division_id:        u.division_id,
      dealer_id:          u.dealer_id,
      shop_ids:           u.csr_shop_ids ? u.csr_shop_ids.split(',').map(Number) : []
    };
  } catch (e) {
    console.error(e);
    error.value = 'Failed to load user';
  } finally {
    loading.value = false;
  }
});

function fetchDivisions() {
  divisions.value = divisions.value.filter(d => d.brand_id === form.value.brand_id);
}

function onRoleChange() {
  if (!isCSR.value) form.value.shop_ids = [];
  if (!isRetailStaff.value) form.value.shop_id = null;
}

async function handleUpdate() {
  loading.value = true;
  try {
    if (isRetailStaff.value && !form.value.shop_id) {
      throw new Error('Please select a shop for Retail Staff');
    }
    if (isCSR.value) {
      if (!form.value.brand_id || !form.value.division_id || !form.value.dealer_id) {
        throw new Error('Please select brand, division and dealer for CSR');
      }
      if (!form.value.shop_ids.length) {
        throw new Error('Please select at least one shop for CSR');
      }
    }

    await api.put(`/users/${id}`, form.value);
    router.push({ name: 'ManageUsers' });
  } catch (e) {
    alert(e.response?.data?.error || e.message || 'Update failed');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* Tailwind handles styling */
</style>
