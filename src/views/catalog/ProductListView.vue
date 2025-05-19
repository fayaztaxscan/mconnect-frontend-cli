<template>
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">Products</h1>
  
      <div class="mb-4 flex items-center gap-4">
        <router-link to="/products/new" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + Add Product
        </router-link>

        <label class="inline-flex items-center">
            <input type="checkbox" v-model="showDeletedOnly" class="mr-2" />
            Show Deleted Only
        </label>
      </div>

  
      <table class="w-full border-collapse border">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2 border">Name</th>
            <th class="p-2 border">Category</th>
            <th class="p-2 border">Price</th>
            <th class="p-2 border">Eligible</th>
            <th class="p-2 border">Status</th>
            <th class="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in visibleProducts" :key="product.id" class="hover:bg-gray-50">
            <td class="p-2 border">{{ product.name }}</td>
            <td class="p-2 border">{{ product.category_name }}</td>
            <td class="p-2 border">₹{{ product.price }}</td>
            <td class="p-2 border">{{ product.is_reward_eligible ? 'Yes' : 'No' }}</td>
            <td class="p-2 border">{{ product.status }}</td>
            <td class="p-2 border space-x-2">
              <router-link :to="`/products/${product.id}/edit`" class="text-blue-600 underline">Edit</router-link>
              <button
                v-if="!product.deleted_at"
                @click="softDelete(product.id)"
                class="text-red-600 underline"
              >
                Delete
              </button>
              <button
                v-else
                @click="restore(product.id)"
                class="text-green-600 underline"
              >
                Restore
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  const baseUrl = process.env.VUE_APP_API_BASE_URL; // ✅ Global for this component
  
  export default {
    name: 'ProductListView',
    data() {
      return {
        products: [],
        showDeletedOnly: false, // ✅ Toggle
      };
    },

    computed: {
    visibleProducts() {
        return this.showDeletedOnly
        ? this.products.filter(p => p.deleted_at)
        : this.products.filter(p => !p.deleted_at);
    }
    },

    async created() {
      await this.fetchProducts();
    },
    methods: {
      async fetchProducts() {
        try {
          const res = await axios.get(`${baseUrl}/products`, this.authHeader());
          this.products = res.data;
        } catch (err) {
          console.error('Failed to fetch products:', err);
        }
      },
      async softDelete(id) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
          await axios.delete(`${baseUrl}/products/${id}`, this.authHeader());
          await this.fetchProducts();
        } catch (err) {
          console.error('Delete failed:', err);
        }
      },
      async restore(id) {
        try {
          await axios.patch(`${baseUrl}/products/${id}/restore`, {}, this.authHeader());
          await this.fetchProducts();
        } catch (err) {
          console.error('Restore failed:', err);
        }
      },
      authHeader() {
        const token = localStorage.getItem('token');
        return {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
      },
    },
  };
  </script>
  
  <style scoped>
  th, td {
    text-align: left;
  }
  </style>
  