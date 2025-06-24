<!-- src/views/users/ManageUsersView.vue -->
<template>
  <div class="max-w-4xl mx-auto p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Manage Users</h1>
      <router-link
        :to="{ name: 'AddUser' }"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
      >
        New User
      </router-link>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border-collapse">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-4 py-2 border">Name</th>
            <th class="px-4 py-2 border">Email</th>
            <th class="px-4 py-2 border">Role</th>
            <th class="px-4 py-2 border">Region</th>
            <th class="px-4 py-2 border">Dealer</th>
            <th class="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in users"
            :key="user.id"
            class="hover:bg-gray-50"
          >
            <td class="px-4 py-2 border">{{ user.display_name }}</td>
            <td class="px-4 py-2 border">{{ user.email }}</td>
            <td class="px-4 py-2 border">{{ user.role_name }}</td>
            <td class="px-4 py-2 border">{{ user.region_name }}</td>
            <td class="px-4 py-2 border">{{ user.dealer_name || '—' }}</td>
            <td class="px-4 py-2 border space-x-2">
              <router-link
                :to="{ name: 'UserDetails', params: { id: user.id } }"
                class="text-blue-600 hover:underline"
              >View</router-link>
              <button
                @click="editUser(user.id)"
                class="text-green-600 hover:underline"
              >Edit</button>
              <button
                @click="deleteUser(user.id)"
                class="text-red-600 hover:underline"
              >Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
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
    const { data } = await api.get('/users');
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
    await api.delete(`/users/${id}`);
    await loadUsers();
  } catch (err) {
    console.error('Delete failed', err);
    alert(err.response?.data?.error || 'Could not delete user');
  }
}

onMounted(loadUsers);
</script>

<style scoped>
/* styling via Tailwind; no changes needed */
</style>
