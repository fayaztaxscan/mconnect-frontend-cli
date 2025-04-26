// File: UserMenu.vue

<template>
  <nav class="bg-white border-b border-gray-200 p-4">
    <ul class="flex space-x-4">
      <li>
        <router-link to="/users/add" class="text-blue-600 hover:underline">Add User</router-link>
      </li>
      <li>
        <router-link to="/users/manage" class="text-blue-600 hover:underline">Manage Users</router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup>
// Simple static menu - no JavaScript logic needed

</script>

<style scoped>
</style>
