<template>
  <div class="p-4 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">
      {{ isEditMode ? 'Edit Product' : 'Create Product' }}
    </h1>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block mb-1 font-medium">Product Name</label>
        <input v-model="form.name" type="text" class="w-full border p-2 rounded" required />
      </div>

      <div>
        <label class="block mb-1 font-medium">Category</label>
        <select v-model="form.category_id" class="w-full border p-2 rounded" required>
          <option disabled value="">Select Category</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <div>
        <label class="block mb-1 font-medium">Price (₹)</label>
        <input v-model.number="form.price" type="number" class="w-full border p-2 rounded" required />
      </div>

      <div>
        <label class="block mb-1 font-medium">Reward Eligible?</label>
        <select v-model="form.is_reward_eligible" class="w-full border p-2 rounded">
          <option :value="true">Yes</option>
          <option :value="false">No</option>
        </select>
      </div>

      <div>
        <label class="block mb-1 font-medium">Status</label>
        <select v-model="form.status" class="w-full border p-2 rounded">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div class="text-right">
        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {{ isEditMode ? 'Update' : 'Create' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

const baseUrl = process.env.VUE_APP_API_BASE_URL; // ✅ Global base URL

export default {
  name: 'ProductFormView',
  data() {
    return {
      form: {
        name: '',
        category_id: '',
        price: 0,
        is_reward_eligible: true,
        status: 'active',
      },
      categories: [],
    };
  },
  computed: {
    isEditMode() {
      return !!this.$route.params.id;
    }
  },
  async created() {
    await this.fetchCategories();
    if (this.isEditMode) {
      await this.fetchProduct();
    }
  },
  methods: {
    authHeader() {
      const token = localStorage.getItem('token');
      return {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    },
    async fetchCategories() {
      try {
        const res = await axios.get(`${baseUrl}/categories`, this.authHeader());
        this.categories = res.data;
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    },
    async fetchProduct() {
      try {
        const res = await axios.get(`${baseUrl}/products`, this.authHeader());
        const product = res.data.find(p => p.id === parseInt(this.$route.params.id));
        if (!product) throw new Error('Not found');
        this.form = {
          name: product.name,
          category_id: product.category_id,
          price: product.price,
          is_reward_eligible: product.is_reward_eligible,
          status: product.status,
        };
      } catch (err) {
        console.error('Failed to load product:', err);
        this.$router.push('/products');
      }
    },
    async handleSubmit() {
      try {
        if (this.isEditMode) {
          await axios.put(`${baseUrl}/products/${this.$route.params.id}`, this.form, this.authHeader());
        } else {
          await axios.post(`${baseUrl}/products`, this.form, this.authHeader());
        }
        this.$router.push('/products');
      } catch (err) {
        console.error('Failed to submit:', err);
      }
    }
  }
};
</script>
