<template>
  <div class="p-4">
    <header class="mb-6">
      <h1 class="text-3xl font-bold">Admin Dashboard</h1>
      <div v-if="isAdmin" class="mt-4 flex space-x-2">
        <router-link
          to="/users/add"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add User
        </router-link>
        <router-link
          to="/users/manage"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Manage Users
        </router-link>
      </div>
    </header>
    <!-- rest of your dashboard content -->
  </div>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth';
const { isAdmin } = useAuth();
</script>
