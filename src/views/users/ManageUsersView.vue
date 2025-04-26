<template>
    <div class="max-w-4xl mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Manage Users</h1>
      <table class="min-w-full bg-white border-collapse">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-4 py-2 border">ID</th>
            <th class="px-4 py-2 border">Name</th>
            <th class="px-4 py-2 border">Email</th>
            <th class="px-4 py-2 border">Role</th>
            <th class="px-4 py-2 border">Region</th>
            <th class="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
            <td class="px-4 py-2 border">{{ user.id }}</td>
            <td class="px-4 py-2 border">{{ user.display_name }}</td>
            <td class="px-4 py-2 border">{{ user.email }}</td>
            <td class="px-4 py-2 border">{{ user.role }}</td>
            <td class="px-4 py-2 border">{{ user.region }}</td>
            <td class="px-4 py-2 border space-x-2">
              <button @click="editUser(user.id)" class="text-blue-600 hover:underline">Edit</button>
              <button @click="deleteUser(user.id)" class="text-red-600 hover:underline">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import api from '@/services/api';
  
  const users = ref([]);
  const router = useRouter();
  
  async function loadUsers() {
    try {
      const { data } = await api.fetchUsers();
      users.value = data;
    } catch (err) {
      console.error('Failed to load users', err);
      alert('Could not load users');
    }
  }
  
  function editUser(id) {
    router.push({ name: 'EditUser', params: { id } });
  }
  
  async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.deleteUser(id);
      await loadUsers();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Could not delete user');
    }
  }
  
  onMounted(loadUsers);
  </script>
  
  <style scoped>
  table {
    display: block;
    overflow-x: auto;
  }
  </style>
  