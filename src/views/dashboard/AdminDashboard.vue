<!-- File: src/views/dashboard/AdminDashboard.vue -->
<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">Admin Dashboard</h1>

    <div v-if="isPrivileged" class="space-y-8">
      <!-- Overview -->
      <section>
        <h2 class="text-xl font-semibold mb-2">Overview</h2>
        <div class="flex flex-wrap gap-2">
          <router-link to="{ name: 'AdminDashboard' }" class="btn-indigo">Dashboard</router-link>
          <router-link to="{ name: 'CSRDashboard' }"   class="btn-blue">CSR Dashboard</router-link>
        </div>
      </section>

      <!-- Sales -->
      <section>
        <h2 class="text-xl font-semibold mb-2">Sales</h2>
        <div class="flex flex-wrap gap-2">
          <router-link to="{ name: 'SalesDashboard' }" class="btn-green">Sales Dashboard</router-link>
          <router-link to="{ name: 'SalesEntry' }"     class="btn-green-light">New Entry</router-link>
          <router-link to="{ name: 'BulkUpload' }"     class="btn-blue-light">Bulk Upload</router-link>
        </div>
      </section>

      <!-- Rewards -->
      <section>
        <h2 class="text-xl font-semibold mb-2">Rewards</h2>
        <div class="flex flex-wrap gap-2">
          <router-link to="{ name: 'RewardRedemption' }" class="btn-yellow">Redemption</router-link>
          <router-link to="{ name: 'RewardDashboard' }"  class="btn-yellow-light">Dashboard</router-link>
        </div>
      </section>

      <!-- Reports -->
      <section>
        <h2 class="text-xl font-semibold mb-2">Reports</h2>
        <div class="flex flex-wrap gap-2">
          <router-link to="{ name: 'ReportsView' }" class="btn-indigo-light">View Reports</router-link>
        </div>
      </section>

      <!-- Settings -->
      <section>
        <h2 class="text-xl font-semibold mb-2">Settings</h2>
        <div class="flex flex-wrap gap-2">
          <router-link to="{ name: 'SettingsView' }"    class="btn-purple">General Settings</router-link>
          <router-link to="{ name: 'AuditLogs' }"       class="btn-red-light">Audit Logs</router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuth } from '@/composables/useAuth';

const { userRole } = useAuth();

const isPrivileged = computed(() => {
  const r = userRole.value?.toLowerCase().replace(/[\s_]+/g, '');
  return r === 'admin' || r === 'superadmin';
});
</script>

<style scoped>
.btn-indigo       { @apply px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700; }
.btn-indigo-light { @apply px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600; }

.btn-blue        { @apply px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700; }
.btn-blue-light  { @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600; }

.btn-green       { @apply px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700; }
.btn-green-light { @apply px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600; }

.btn-yellow       { @apply px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700; }
.btn-yellow-light { @apply px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600; }

.btn-purple      { @apply px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700; }
.btn-red-light   { @apply px-4 py-2 bg-red-500   text-white rounded hover:bg-red-600; }
</style>
