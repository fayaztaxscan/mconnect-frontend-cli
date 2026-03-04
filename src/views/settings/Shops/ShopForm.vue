<!-- src/views/settings/ShopForm.vue -->
<template>
  <div class="max-w-xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
    <h1 class="text-2xl font-bold mb-6">
      {{ isEdit ? 'Edit Shop' : 'New Shop' }}
    </h1>

    <form @submit.prevent="submit" class="space-y-5">
      <!-- Dealer (required) -->
      <div>
        <label class="block text-sm font-medium text-gray-700">Dealer *</label>
        <select
          v-model.number="form.dealer_id"
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
          @change="onDealerChange"
        >
          <option disabled value="">Select Dealer</option>
          <option v-for="d in dealers" :key="d.id" :value="d.id">
            {{ d.name }}
          </option>
        </select>
        <p v-if="dealerError" class="mt-1 text-xs text-red-600">{{ dealerError }}</p>
      </div>

      <!-- Brand (read-only from dealer) -->
      <div>
        <label class="block text-sm font-medium text-gray-700">Brand</label>
        <div class="mt-1 px-4 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-800">
          {{ derivedBrandName || (derivedBrandId ? `Brand #${derivedBrandId}` : 'Select dealer to auto-fill') }}
        </div>
      </div>

      <!-- Region (read-only from dealer) -->
      <div>
        <label class="block text-sm font-medium text-gray-700">Region (Country)</label>
        <div class="mt-1 px-4 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-800">
          {{ derivedRegionName || (derivedRegionId ? `Region #${derivedRegionId}` : 'Select dealer to auto-fill') }}
        </div>
      </div>

      <!-- Division (required, filtered by brand) -->
      <div>
        <label class="block text-sm font-medium text-gray-700">Division *</label>
        <select
          v-model.number="form.division_id"
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          :disabled="!derivedBrandId || divisionsLoading"
          required
        >
          <option disabled value="">
            {{ !derivedBrandId ? 'Select dealer first' : (divisionsLoading ? 'Loading divisions...' : 'Select Division') }}
          </option>
          <option v-for="dv in divisions" :key="dv.id" :value="dv.id">
            {{ dv.name }}
          </option>
        </select>

        <!-- Helpful hint if API returns empty -->
        <p v-if="!divisionsLoading && derivedBrandId && divisions.length === 0" class="mt-1 text-xs text-amber-600">
          No divisions found for this brand. Add divisions under Divisions module.
        </p>

        <p v-if="divisionError" class="mt-1 text-xs text-red-600">{{ divisionError }}</p>
      </div>

      <!-- Shop Code (optional, backend can generate) -->
      <div>
        <label for="shop_code" class="block text-sm font-medium text-gray-700">
          Shop Code <span class="text-gray-400 text-xs">(optional)</span>
        </label>
        <input
          id="shop_code"
          v-model="form.shop_code"
          type="text"
          placeholder="Leave blank to auto-generate"
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label for="name" class="block text-sm font-medium text-gray-700">Name *</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label for="address" class="block text-sm font-medium text-gray-700">Address</label>
        <textarea
          id="address"
          v-model="form.address"
          rows="3"
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        ></textarea>
      </div>

      <div>
        <label for="contact_name" class="block text-sm font-medium text-gray-700">Contact Name</label>
        <input
          id="contact_name"
          v-model="form.contact_name"
          type="text"
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label for="contact_phone" class="block text-sm font-medium text-gray-700">Contact Phone</label>
        <input
          id="contact_phone"
          v-model="form.contact_phone"
          type="text"
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label for="location" class="block text-sm font-medium text-gray-700">Location</label>
        <input
          id="location"
          v-model="form.location"
          type="text"
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div class="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          @click="$router.back()"
          class="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {{ loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Shop' : 'Create Shop') }}
        </button>
      </div>

      <p v-if="error" class="mt-4 text-red-600">{{ error }}</p>
    </form>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'ShopForm',
  props: ['id'],
  data() {
    return {
      form: {
        shop_code: '',
        name: '',
        address: '',
        contact_name: '',
        contact_phone: '',
        email: '',
        location: '',

        dealer_id: '',
        division_id: ''
      },

      dealers: [],
      divisions: [],
      divisionsLoading: false,

      regions: [],
      loading: false,
      error: '',

      dealerError: '',
      divisionError: '',

      derivedBrandId: null,
      derivedBrandName: '',
      derivedRegionId: null,
      derivedRegionName: ''
    };
  },
  computed: {
    isEdit() {
      return Boolean(this.id);
    },
    selectedDealer() {
      const did = Number(this.form.dealer_id);
      if (!did) return null;
      return this.dealers.find(d => Number(d.id) === did) || null;
    }
  },
  methods: {
    // ✅ Robust array unwrapping for all your API shapes, including { items: [...] }
    unwrapArray(payload) {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.rows)) return payload.rows;
      if (Array.isArray(payload?.items)) return payload.items;           // ✅ important (your divisions endpoint)
      if (Array.isArray(payload?.data?.rows)) return payload.data.rows;
      if (Array.isArray(payload?.data?.items)) return payload.data.items;
      if (Array.isArray(payload?.data?.data)) return payload.data.data; // tolerate nesting
      return [];
    },

    async fetchRegions() {
      try {
        const res = await api.get('/regions');
        this.regions = this.unwrapArray(res.data);
      } catch {
        this.regions = [];
      }
    },

    async fetchDealers() {
      try {
        const res = await api.get('/dealers');
        // dealers endpoint may be {data:[...]} with pagination meta
        this.dealers = this.unwrapArray(res.data);
      } catch {
        this.dealers = [];
      }
    },

    async fetchDivisionsByBrand(brandId) {
      if (!brandId) {
        this.divisions = [];
        return;
      }
      this.divisionsLoading = true;
      try {
        // ✅ your backend returns { items: [...] }
        const res = await api.get(`/brands/${brandId}/divisions`);
        this.divisions = this.unwrapArray(res.data);
      } catch (e) {
        console.error('Divisions fetch failed:', e);
        this.divisions = [];
      } finally {
        this.divisionsLoading = false;
      }
    },

    applyDealerDerivedFields() {
      const d = this.selectedDealer;
      if (!d) {
        this.derivedBrandId = null;
        this.derivedBrandName = '';
        this.derivedRegionId = null;
        this.derivedRegionName = '';
        return;
      }

      this.derivedBrandId = d.brand_id ? Number(d.brand_id) : null;
      this.derivedBrandName = d.brand_name || '';

      this.derivedRegionId = d.region_id ? Number(d.region_id) : null;
      this.derivedRegionName =
        d.region_name ||
        (this.derivedRegionId
          ? (this.regions.find(r => Number(r.id) === Number(this.derivedRegionId))?.name || '')
          : '');
    },

    async onDealerChange() {
      this.dealerError = '';
      this.divisionError = '';

      this.applyDealerDerivedFields();

      // Reset division when dealer changes
      this.form.division_id = '';

      // Load divisions for dealer's brand
      await this.fetchDivisionsByBrand(this.derivedBrandId);
    },

    async fetchShop() {
      if (!this.isEdit) return;

      try {
        const res = await api.get(`/shops/${this.id}`);
        const data = res.data?.data ?? res.data; // tolerate {success,data}

        this.form.shop_code = data.shop_code || '';
        this.form.name = data.name || '';
        this.form.address = data.address || '';
        this.form.contact_name = data.contact_name || '';
        this.form.contact_phone = data.contact_phone || '';
        this.form.email = data.email || '';
        this.form.location = data.location || '';

        this.form.dealer_id = data.dealer_id || '';
        this.form.division_id = data.division_id || '';

        // derive and load divisions
        this.applyDealerDerivedFields();
        if (this.derivedBrandId) {
          await this.fetchDivisionsByBrand(this.derivedBrandId);

          // If current division_id isn't in the loaded list, clear it
          const ok = this.divisions.some(dv => Number(dv.id) === Number(this.form.division_id));
          if (!ok) this.form.division_id = '';
        }
      } catch {
        this.$router.back();
      }
    },

    validate() {
      this.dealerError = '';
      this.divisionError = '';

      if (!Number(this.form.dealer_id)) {
        this.dealerError = 'Dealer is required';
        return false;
      }
      if (!Number(this.form.division_id)) {
        this.divisionError = 'Division is required';
        return false;
      }
      return true;
    },

    async submit() {
      this.loading = true;
      this.error = '';

      try {
        if (!this.validate()) return;

        const payload = {
          shop_code: this.form.shop_code || '',
          name: this.form.name,
          address: this.form.address || null,
          contact_name: this.form.contact_name || null,
          contact_phone: this.form.contact_phone || null,
          email: this.form.email || null,
          location: this.form.location || null,
          dealer_id: Number(this.form.dealer_id),
          division_id: Number(this.form.division_id)
        };

        if (this.isEdit) {
          await api.put(`/shops/${this.id}`, payload);
        } else {
          await api.post('/shops', payload);
        }

        this.$router.push({ name: 'ShopsList' });
      } catch (err) {
        this.error =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          'Operation failed';
      } finally {
        this.loading = false;
      }
    },

    async init() {
      await this.fetchRegions();
      await this.fetchDealers();
      await this.fetchShop();

      // create mode: if dealer already pre-filled somehow, load divisions
      if (!this.isEdit && Number(this.form.dealer_id)) {
        await this.onDealerChange();
      }
    }
  },
  created() {
    this.init();
  }
};
</script>

<style scoped>
/* No additional styles */
</style>
