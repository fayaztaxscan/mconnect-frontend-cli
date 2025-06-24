<!-- src/views/dashboard/AdminDashboard.vue -->
<template>
  <div class="max-w-4xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Admin Dashboard</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <router-link
        :to="{ name: 'ManageUsers' }"
        class="block bg-white p-6 border border-gray-200 rounded shadow hover:shadow-lg"
      >
        <h2 class="text-xl font-semibold mb-2">User Management</h2>
        <p class="text-gray-600">Create, edit, and delete users.</p>
      </router-link>

      <router-link
        :to="{ name: 'ManageRewardCategories' }"
        class="block bg-white p-6 border border-gray-200 rounded shadow hover:shadow-lg"
      >
        <h2 class="text-xl font-semibold mb-2">Reward Categories</h2>
        <p class="text-gray-600">Manage all reward categories.</p>
      </router-link>

      <router-link
        :to="{ name: 'ManageRewardItems' }"
        class="block bg-white p-6 border border-gray-200 rounded shadow hover:shadow-lg"
      >
        <h2 class="text-xl font-semibold mb-2">Reward Items</h2>
        <p class="text-gray-600">Manage all reward items.</p>
      </router-link>

      <router-link
        :to="{ name: 'ReportsView' }"
        class="block bg-white p-6 border border-gray-200 rounded shadow hover:shadow-lg"
      >
        <h2 class="text-xl font-semibold mb-2">Reports</h2>
        <p class="text-gray-600">View system reports.</p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
// no script logic needed here
</script>

<style scoped>
/* purely Tailwind styling */
</style>
