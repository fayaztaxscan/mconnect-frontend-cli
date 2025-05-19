<template>
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">Categories</h1>
  
      <div class="mb-4 flex items-center gap-4">
        <router-link to="/categories/new" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + Add Category
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
            <th class="p-2 border">Min Sales Threshold</th>
            <th class="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
            <tr v-for="cat in visibleCategories" :key="cat.id" class="hover:bg-gray-50">
                <td class="p-2 border">{{ cat.name }}</td>
                <td class="p-2 border">{{ cat.min_sales_threshold }}</td>
                <td class="p-2 border space-x-2">
                <router-link :to="`/categories/${cat.id}/edit`" class="text-blue-600 underline">Edit</router-link>
                <button
                    v-if="!cat.deleted_at"
                    @click="softDelete(cat.id)"
                    class="text-red-600 underline"
                >
                    Delete
                </button>
                <button
                    v-else
                    @click="restore(cat.id)"
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

    const baseUrl = process.env.VUE_APP_API_BASE_URL; // ✅ GLOBAL

    export default {
    name: 'CategoryListView',
    data() {
        return {
        categories: [],
        showDeletedOnly: false // ✅ Toggle for filtering
        };
    },
    computed: {
        visibleCategories() {
        return this.showDeletedOnly
            ? this.categories.filter(cat => cat.deleted_at)
            : this.categories.filter(cat => !cat.deleted_at);
        }
    },
    async created() {
        await this.fetchCategories();
    },
    methods: {
        async fetchCategories() {
        try {
            const res = await axios.get(`${baseUrl}/categories`, this.authHeader()); // ✅ use global
            this.categories = res.data;
            console.log('🔍 categories response:', res.data);

        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
        },
        async softDelete(id) {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await axios.delete(`${baseUrl}/categories/${id}`, this.authHeader()); // ✅ use global
            await this.fetchCategories();
        } catch (err) {
            console.error('Delete failed:', err);
        }
        },
        async restore(id) {
        try {
            await axios.patch(`${baseUrl}/categories/${id}/restore`, {}, this.authHeader()); // ✅ use global
            await this.fetchCategories();
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
  