<template>
    <div class="p-4 max-w-xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">
        {{ isEditMode ? 'Edit Category' : 'Create Category' }}
      </h1>
  
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block mb-1 font-medium">Category Name</label>
          <input v-model="form.name" type="text" class="w-full border p-2 rounded" required />
        </div>
  
        <div>
          <label class="block mb-1 font-medium">Minimum Sales Threshold</label>
          <input v-model.number="form.min_sales_threshold" type="number" class="w-full border p-2 rounded" required />
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

    const baseUrl = process.env.VUE_APP_API_BASE_URL; // ✅ Global usage

    export default {
    name: 'CategoryFormView',
    data() {
        return {
        form: {
            name: '',
            min_sales_threshold: 0
        }
        };
    },
    computed: {
        isEditMode() {
        return !!this.$route.params.id;
        }
    },
    async created() {
        if (this.isEditMode) {
        await this.fetchCategory();
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
        async fetchCategory() {
        try {
            const res = await axios.get(`${baseUrl}/categories`, this.authHeader()); // ✅ use global baseUrl
            const match = res.data.find(c => c.id === parseInt(this.$route.params.id));
            if (!match) throw new Error('Category not found');
            this.form = {
            name: match.name,
            min_sales_threshold: match.min_sales_threshold
            };
        } catch (err) {
            console.error('Failed to fetch category:', err);
            this.$router.push('/categories');
        }
        },
        async handleSubmit() {
        try {
            if (this.isEditMode) {
            await axios.put(`${baseUrl}/categories/${this.$route.params.id}`, this.form, this.authHeader()); // ✅
            } else {
            await axios.post(`${baseUrl}/categories`, this.form, this.authHeader()); // ✅
            }
            this.$router.push('/categories');
        } catch (err) {
            console.error('Failed to submit:', err);
        }
        }
    }
    };
</script>

  