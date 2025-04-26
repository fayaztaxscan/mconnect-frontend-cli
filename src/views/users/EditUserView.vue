<template>
    <div class="max-w-xl mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Edit User {{ id }}</h1>
  
      <form @submit.prevent="handleUpdate" class="space-y-4 bg-white p-6 rounded shadow">
        <div class="space-y-1">
          <label for="display_name" class="block text-sm font-medium text-gray-700">Display Name</label>
          <input
            id="display_name"
            v-model="form.display_name"
            type="text"
            required
            class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
  
        <div class="space-y-1">
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
  
        <div class="space-y-1">
          <label for="password" class="block text-sm font-medium text-gray-700">
            Password (leave blank to keep current)
          </label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
  
        <div class="space-y-1">
          <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
          <select
            id="role"
            v-model="form.role_id"
            required
            class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option disabled value="">Select Role</option>
            <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
          </select>
        </div>
  
        <div class="space-y-1">
          <label for="region" class="block text-sm font-medium text-gray-700">Region</label>
          <select
            id="region"
            v-model="form.region_id"
            required
            class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option disabled value="">Select Region</option>
            <option v-for="region in regions" :key="region.id" :value="region.id">{{ region.name }}</option>
          </select>
        </div>
  
        <div class="pt-4 flex justify-end space-x-2">
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
            class="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {{ loading ? 'Updating…' : 'Update User' }}
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import api from '@/services/api';
  
  const route = useRoute();
  const router = useRouter();
  const id = route.params.id;
  
  const form = ref({
    display_name: '',
    email: '',
    password: '',
    role_id: '',
    region_id: ''
  });
  
  const roles = ref([]);
  const regions = ref([]);
  const loading = ref(false);
  
  async function loadLookups() {
    const [r1, r2] = await Promise.all([api.fetchRoles(), api.fetchRegions()]);
    roles.value = r1.data;
    regions.value = r2.data;
  }
  
  async function loadUser() {
    try {
      const { data } = await api.instance.get(`/users/${id}`);
      form.value.display_name = data.display_name;
      form.value.email        = data.email;
      form.value.role_id      = data.role_id;
      form.value.region_id    = data.region_id;
    } catch (err) {
      console.error('Failed to load user:', err);
      alert('Could not load user data');
      router.back();
    }
  }
  
  onMounted(async () => {
    await loadLookups();
    await loadUser();
  });
  
  async function handleUpdate() {
    loading.value = true;
    try {
      await api.updateUser(id, form.value);
      router.push({ name: 'ManageUsers' });
    } catch (err) {
      console.error('Update failed:', err.response?.data || err);
      alert(err.response?.data?.error || 'Update failed');
    } finally {
      loading.value = false;
    }
  }
  </script>
  