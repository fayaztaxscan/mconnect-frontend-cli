<template>
  <div class="max-w-xl mx-auto p-4">
    <h2 class="text-xl font-bold mb-4">Add New User</h2>

    <form @submit.prevent="handleSubmit" class="space-y-6 bg-white p-6 rounded shadow">
      <!-- Display Name -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
        <input
          v-model="form.display_name"
          type="text"
          placeholder="Display Name"
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
          placeholder="Email"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <!-- Password -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          v-model="form.password"
          type="password"
          placeholder="Password"
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
          placeholder="Phone number"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <!-- Preferred Language -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
        <select
          v-model="form.preferred_language"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option disabled value="">Select Language</option>
          <option v-for="lang in languages" :key="lang.id" :value="lang.code">
            {{ lang.name }}
          </option>
        </select>
      </div>

      <!-- Role -->
      <div class="relative" ref="roleRef">
        <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <button
          type="button"
          @click="roleOpen = !roleOpen"
          class="w-full flex justify-between items-center px-4 py-2 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <span>{{ selectedRoleName || 'Select Role' }}</span>
          <svg class="h-4 w-4 text-gray-500" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <ul
          v-if="roleOpen"
          class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow max-h-60 overflow-auto"
        >
          <li
            v-for="role in roles"
            :key="role.id"
            @click="selectRole(role.id)"
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          >
            {{ role.name }}
          </li>
        </ul>
      </div>

      <!-- Region -->
      <div class="relative" ref="regionRef">
        <label class="block text-sm font-medium text-gray-700 mb-1">Region</label>
        <button
          type="button"
          @click="regionOpen = !regionOpen"
          class="w-full flex justify-between items-center px-4 py-2 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <span>{{ selectedRegionName || 'Select Region' }}</span>
          <svg class="h-4 w-4 text-gray-500" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <ul
          v-if="regionOpen"
          class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow max-h-60 overflow-auto"
        >
          <li
            v-for="region in regions"
            :key="region.id"
            @click="selectRegion(region.id)"
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          >
            {{ region.name }}
          </li>
        </ul>
      </div>

      <!-- Shop for Retail Staff -->
      <div v-if="isRetailStaff">
        <label class="block text-sm font-medium text-gray-700 mb-1">Shop</label>
        <select
          v-model="form.shop_id"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option disabled value="">Select Shop</option>
          <option v-for="shop in shops" :key="shop.id" :value="shop.id">
            {{ shop.name }}
          </option>
        </select>
      </div>

      <!-- CSR fields -->
      <div v-if="isCSR" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Brand</label>
          <select
            v-model="form.brand_id"
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
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Assign Shops</label>
          <select
            v-model="form.shop_ids"
            multiple
            class="w-full h-32 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option
              v-for="shop in shops"
              :key="shop.id"
              :value="shop.id"
            >
              {{ shop.name }} ({{ shop.shop_code }})
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
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
        >
          Create User
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const router = useRouter();

// form state
const form = ref({
  display_name:       '',
  email:              '',
  password:           '',
  phone:              '',
  preferred_language: '',
  role_id:            null,
  region_id:          null,
  shop_id:            null,
  brand_id:           null,
  division_id:        null,
  dealer_id:          null,
  shop_ids:           []
});

// lookup lists
const roles     = ref([]);
const regions   = ref([]);
const shops     = ref([]);
const dealers   = ref([]);
const languages = ref([]);
const brands    = ref([]);
const divisions = ref([]);

// combobox controls
const roleOpen   = ref(false);
const regionOpen = ref(false);
const roleRef    = ref(null);
const regionRef  = ref(null);

// computed
const selectedRoleName   = computed(() =>
  roles.value.find(r => r.id === form.value.role_id)?.name || ''
);
const selectedRegionName = computed(() =>
  regions.value.find(rg => rg.id === form.value.region_id)?.name || ''
);
const isRetailStaff = computed(() => selectedRoleName.value === 'Retail Staff');
const isCSR         = computed(() => selectedRoleName.value === 'CSR');

// load data
onMounted(async () => {
  const [rRoles, rRegions, rShops, rDealers, rLangs] = await Promise.all([
    api.get('/roles'),
    api.get('/regions'),
    api.get('/shops'),
    api.get('/dealers'),
    api.get('/localization/languages')
  ]);
  roles.value     = rRoles.data;
  regions.value   = rRegions.data;
  shops.value     = rShops.data;
  dealers.value   = rDealers.data;
  languages.value = rLangs.data;
  document.addEventListener('click', onClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside);
});

function onClickOutside(e) {
  if (roleOpen.value && roleRef.value && !roleRef.value.contains(e.target)) {
    roleOpen.value = false;
  }
  if (regionOpen.value && regionRef.value && !regionRef.value.contains(e.target)) {
    regionOpen.value = false;
  }
}

// fetch CSR lookups
watch(() => form.value.role_id, async () => {
  if (isCSR.value) {
    const [rBrands, rDivs] = await Promise.all([
      api.get('/brands'),
      api.get('/divisions')
    ]);
    brands.value    = rBrands.data;
    divisions.value = rDivs.data;
  } else {
    form.value.brand_id    = null;
    form.value.division_id = null;
    form.value.dealer_id   = null;
    form.value.shop_ids    = [];
  }
});

// selection handlers
function selectRole(id) {
  form.value.role_id = id;
  form.value.shop_id      = null;
  form.value.brand_id     = null;
  form.value.division_id  = null;
  form.value.dealer_id    = null;
  form.value.shop_ids     = [];
  roleOpen.value = false;
}
function selectRegion(id) {
  form.value.region_id = id;
  regionOpen.value = false;
}

// submit
async function handleSubmit() {
  if (isRetailStaff.value && !form.value.shop_id) {
    return alert('Please select a shop for Retail Staff');
  }
  if (isCSR.value) {
    if (!form.value.brand_id || !form.value.division_id || !form.value.dealer_id) {
      return alert('Please select brand, division and dealer for CSR');
    }
    if (!form.value.shop_ids.length) {
      return alert('Please select at least one shop for CSR');
    }
  }
  try {
    await api.post('/users', form.value);
    router.push({ name: 'ManageUsers' });
  } catch (err) {
    alert(err.response?.data?.error || 'User creation failed');
  }
}
</script>

<style scoped>
/* Tailwind handles styling */
</style>
