<!-- src/views/settings/DealerForm.vue -->
<template>
  <div class="max-w-xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
    <h1 class="text-2xl font-bold mb-6">
      {{ isEdit ? 'Edit Dealer' : 'New Dealer' }}
    </h1>

    <form @submit.prevent="submit" class="space-y-5">
      <!-- Dealer Code -->
      <div>
        <label for="dealer_code" class="block text-sm font-medium text-gray-700">Dealer Code</label>
        <input
          id="dealer_code"
          v-model="form.dealer_code"
          type="text"
          required
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <!-- Address -->
      <div>
        <label for="address" class="block text-sm font-medium text-gray-700">Address</label>
        <textarea
          id="address"
          v-model="form.address"
          rows="3"
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        ></textarea>
      </div>

      <!-- Primary Contact Name -->
      <div>
        <label for="contact_name" class="block text-sm font-medium text-gray-700">Primary Contact Name</label>
        <input
          id="contact_name"
          v-model="form.primary_contact_name"
          type="text"
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <!-- Primary Contact Phone -->
      <div>
        <label for="contact_phone" class="block text-sm font-medium text-gray-700">Primary Contact Phone</label>
        <input
          id="contact_phone"
          v-model="form.primary_contact_phone"
          type="text"
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <!-- Email -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <!-- Region -->
      <div>
        <label for="region" class="block text-sm font-medium text-gray-700">Region</label>
        <select
          id="region"
          v-model="form.region_id"
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option disabled value="">Select Region</option>
          <option v-for="r in regions" :key="r.id" :value="r.id">{{ r.name }}</option>
        </select>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          @click="$router.back()"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {{ loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Dealer' : 'Create Dealer') }}
        </button>
      </div>

      <!-- Error Message -->
      <p v-if="error" class="mt-4 text-red-600">{{ error }}</p>
    </form>
  </div>
</template>

<script>
import api from '@/services/api';
export default {
  name: 'DealerForm',
  props: ['id'],
  data() {
    return {
      form: {
        dealer_code: '',
        name: '',
        address: '',
        primary_contact_name: '',
        primary_contact_phone: '',
        email: '',
        region_id: null
      },
      regions: [],
      loading: false,
      error: ''
    };
  },
  computed: {
    isEdit() {
      return Boolean(this.id);
    }
  },
  methods: {
    async fetchRegions() {
      try {
        const { data } = await api.get('/regions');
        this.regions = data;
      } catch (err) {
        console.error('Failed to load regions:', err);
      }
    },
    async fetchDealer() {
      if (!this.isEdit) return;
      try {
        const { data } = await api.get(`/dealers/${this.id}`);
        Object.assign(this.form, data);
      } catch (err) {
        console.error('Failed to load dealer:', err);
        this.$router.back();
      }
    },
    async submit() {
      this.loading = true;
      this.error = '';
      try {
        if (this.isEdit) {
          await api.put(`/dealers/${this.id}`, this.form);
        } else {
          await api.post('/dealers', this.form);
        }
        this.$router.push({ name: 'DealersList' });
      } catch (err) {
        this.error = err.response?.data?.error || 'Operation failed';
      } finally {
        this.loading = false;
      }
    }
  },
  created() {
    this.fetchRegions();
    this.fetchDealer();
  }
};
</script>

<style scoped>
/* No extra styles—Tailwind covers layout */
</style>
