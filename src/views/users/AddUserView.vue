<template>
    <div class="max-w-xl mx-auto p-4">
      <h2 class="text-xl font-bold mb-4">Add New User</h2>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <input
          v-model="form.display_name"
          type="text"
          placeholder="Display Name"
          class="input"
          required
        />
        <input
          v-model="form.email"
          type="email"
          placeholder="Email"
          class="input"
          required
        />
        <input
          v-model="form.password"
          type="password"
          placeholder="Password"
          class="input"
          required
        />
        <select v-model="form.role_id" class="input" required>
          <option disabled value="">Select Role</option>
          <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
        </select>
        <select v-model="form.region_id" class="input" required>
          <option disabled value="">Select Region</option>
          <option v-for="region in regions" :key="region.id" :value="region.id">{{ region.name }}</option>
        </select>
        <button type="submit" class="bg-blue-600 text-white py-2 px-4 rounded">
          Create User
        </button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import api from '@/services/api';
  
  const router = useRouter();
  const form = ref({ display_name: '', email: '', password: '', role_id: '', region_id: '' });
  const roles = ref([]);
  const regions = ref([]);
  
  onMounted(async () => {
    roles.value = (await api.fetchRoles()).data;
    regions.value = (await api.fetchRegions()).data;
  });
  
  async function handleSubmit() {
    console.log('🚀 handleSubmit payload:', form.value);
    try {
      await api.createUser(form.value);
      router.push({ name: 'ManageUsers' });
    } catch (err) {
      console.error('Create user error:', err.response?.data || err);
      alert(err.response?.data?.error || 'User creation failed');
    }
  }
  </script>
  