<!-- src/views/users/EditUserView.vue  ✅ EDIT USER PAGE -->
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
            v-for="lang in safeLanguages"
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
          v-model.number="form.role_id"
          @change="onRoleChange"
          :disabled="isCSR"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option disabled value="">Select Role</option>
          <option
            v-for="r in safeRoles"
            :key="r.id"
            :value="Number(r.id)"
          >
            {{ r.name }}
          </option>
        </select>
      </div>

      <!-- Region -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Region</label>
        <select
          v-model.number="form.region_id"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option disabled value="">Select Region</option>
          <option
            v-for="rg in safeRegions"
            :key="rg.id"
            :value="Number(rg.id)"
          >
            {{ rg.name }}
          </option>
        </select>
      </div>

      <!-- Retail Staff shop -->
      <div v-if="isRetailStaff">
        <label class="block text-sm font-medium text-gray-700 mb-1">Shop</label>
        <select
          v-model.number="form.shop_id"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option disabled value="">Select Shop</option>
          <option
            v-for="s in safeShops"
            :key="s.id"
            :value="Number(s.id)"
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
            v-model.number="form.brand_id"
            class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option disabled value="">Select Brand</option>
            <option v-for="b in safeBrands" :key="b.id" :value="Number(b.id)">
              {{ b.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Division</label>
          <select
            v-model.number="form.division_id"
            class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option disabled value="">Select Division</option>
            <option v-for="d in filteredDivisions" :key="d.id" :value="Number(d.id)">
              {{ d.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Dealer</label>
          <select
            v-model.number="form.dealer_id"
            class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option disabled value="">Select Dealer</option>
            <option v-for="d in safeDealers" :key="d.id" :value="Number(d.id)">
              {{ d.name }} <span v-if="d.dealer_code">({{ d.dealer_code }})</span>
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
            <option
              v-for="s in safeShops"
              :key="s.id"
              :value="Number(s.id)"
            >
              {{ s.name }} <span v-if="s.shop_code">({{ s.shop_code }})</span>
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
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';

const route  = useRoute();
const router = useRouter();
const id     = route.params.id;

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
  display_name: '',
  email: '',
  phone: '',
  preferred_language: '',
  password: '',
  role_id: null,
  region_id: null,
  shop_id: null,
  brand_id: null,
  division_id: null,
  dealer_id: null,
  shop_ids: []
});

// -------- helpers (important for your current issue) -----------------
function unwrapArray(payload) {
  // supports many common API shapes:
  // [] | {data: []} | {success:true, data: []} | {rows: []} | {data:{rows:[]}} | {data:{items:[]}}
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.rows)) return payload.data.rows;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeRole(r) {
  return {
    ...r,
    id: num(r?.id ?? r?.role_id),
    name: r?.name ?? r?.role_name ?? ''
  };
}

function normalizeRegion(rg) {
  return {
    ...rg,
    id: num(rg?.id ?? rg?.region_id),
    name: rg?.name ?? rg?.region_name ?? ''
  };
}

function normalizeShop(s) {
  return {
    ...s,
    id: num(s?.id ?? s?.shop_id),
    name: s?.name ?? s?.shop_name ?? '',
    shop_code: s?.shop_code ?? s?.code ?? ''
  };
}

function normalizeDealer(d) {
  return {
    ...d,
    id: num(d?.id ?? d?.dealer_id),
    name: d?.name ?? d?.dealer_name ?? '',
    dealer_code: d?.dealer_code ?? d?.code ?? ''
  };
}

function normalizeBrand(b) {
  return {
    ...b,
    id: num(b?.id ?? b?.brand_id),
    name: b?.name ?? b?.brand_name ?? ''
  };
}

function normalizeDivision(d) {
  return {
    ...d,
    id: num(d?.id ?? d?.division_id),
    name: d?.name ?? d?.division_name ?? '',
    brand_id: num(d?.brand_id ?? d?.brandId ?? d?.brandID) // keep for filtering
  };
}

function parseCsvIds(value) {
  if (Array.isArray(value)) return value.map(num).filter(Boolean);
  if (typeof value === 'string') {
    return value.split(',').map(v => num(v?.trim())).filter(Boolean);
  }
  return [];
}
// --------------------------------------------------------------------

// ✅ Safe lists (normalized)
const safeRoles     = computed(() => (roles.value || []).filter(x => x && x.id && x.name));
const safeRegions   = computed(() => (regions.value || []).filter(x => x && x.id && x.name));
const safeShops     = computed(() => (shops.value || []).filter(x => x && x.id && x.name));
const safeDealers   = computed(() => (dealers.value || []).filter(x => x && x.id && x.name));
const safeLanguages = computed(() => (languages.value || []).filter(Boolean));
const safeBrands    = computed(() => (brands.value || []).filter(x => x && x.id && x.name));
const safeDivisions = computed(() => (divisions.value || []).filter(x => x && x.id && x.name));

const selectedRoleName = computed(() =>
  safeRoles.value.find(r => Number(r.id) === Number(form.value.role_id))?.name || ''
);
const isCSR         = computed(() => selectedRoleName.value === 'CSR');
const isRetailStaff = computed(() => selectedRoleName.value === 'Retail Staff');

// ✅ Division filter (tolerant if brand_id missing)
const filteredDivisions = computed(() => {
  const brandId = Number(form.value.brand_id);
  if (!brandId) return safeDivisions.value;

  const hasBrandLink = safeDivisions.value.some(d => d.brand_id != null);
  if (!hasBrandLink) return safeDivisions.value; // backend didn’t send brand_id → don’t hide all

  return safeDivisions.value.filter(d => Number(d.brand_id) === brandId);
});

watch(() => form.value.brand_id, () => {
  const ok = filteredDivisions.value.some(d => Number(d.id) === Number(form.value.division_id));
  if (!ok) form.value.division_id = null;
});

function onRoleChange() {
  if (!isCSR.value) {
    form.value.brand_id = null;
    form.value.division_id = null;
    form.value.dealer_id = null;
    form.value.shop_ids = [];
  }
  if (!isRetailStaff.value) {
    form.value.shop_id = null;
  }
}

onMounted(async () => {
  loading.value = true;
  error.value = '';

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

    roles.value     = unwrapArray(rRoles.data).map(normalizeRole);
    regions.value   = unwrapArray(rRegions.data).map(normalizeRegion);
    shops.value     = unwrapArray(rShops.data).map(normalizeShop);
    dealers.value   = unwrapArray(rDealers.data).map(normalizeDealer);
    languages.value = unwrapArray(rLangs.data);
    brands.value    = unwrapArray(rBrands.data).map(normalizeBrand);
    divisions.value = unwrapArray(rDivs.data).map(normalizeDivision);

    const u = userRes.data || {};

    form.value = {
      display_name: u.display_name || '',
      email: u.email || '',
      phone: u.phone || '',
      preferred_language: u.preferred_language || '',
      password: '',
      role_id: num(u.role_id),
      region_id: num(u.region_id),
      shop_id: num(u.retail_shop_id),
      brand_id: num(u.brand_id),
      division_id: num(u.division_id),
      dealer_id: num(u.dealer_id),
      shop_ids: parseCsvIds(u.csr_shop_ids)
    };
  } catch (e) {
    console.error(e);
    error.value = e?.response?.data?.error || e?.message || 'Failed to load user';
  } finally {
    loading.value = false;
  }
});

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

    const payload = {
      ...form.value,
      role_id: num(form.value.role_id),
      region_id: num(form.value.region_id),
      shop_id: num(form.value.shop_id),
      brand_id: num(form.value.brand_id),
      division_id: num(form.value.division_id),
      dealer_id: num(form.value.dealer_id),
      shop_ids: Array.isArray(form.value.shop_ids) ? form.value.shop_ids.map(num).filter(Boolean) : []
    };

    await api.put(`/users/${id}`, payload);
    router.push({ name: 'ManageUsers' });
  } catch (e) {
    console.error(e);
    alert(e?.response?.data?.error || e?.message || 'Update failed');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* Tailwind handles styling */
</style>
