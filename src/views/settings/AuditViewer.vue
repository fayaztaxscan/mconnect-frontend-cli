<!-- src/components/ui/AuditViewer.vue -->
<template>
  <div class="p-4 max-w-2xl mx-auto">
    <h2 class="text-2xl font-semibold mb-4">Audit Logs</h2>
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-gray-100">
          <th class="border p-2">ID</th>
          <th class="border p-2">Entity</th>
          <th class="border p-2">Action</th>
          <th class="border p-2">User</th>
          <th class="border p-2">Timestamp</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50">
          <td class="border p-2">{{ log.id }}</td>
          <td class="border p-2">{{ log.entityType }}#{{ log.entityId }}</td>
          <td class="border p-2">{{ log.action }}</td>
          <td class="border p-2">{{ log.changedBy }}</td>
          <td class="border p-2">{{ new Date(log.changedAt).toLocaleString() }}</td>
        </tr>
      </tbody>
    </table>
    <div v-if="error" class="mt-4 text-red-600">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api'; // ← your axios instance, with baseURL and auth‐header

const logs = ref([]);
const error = ref('');
const router = useRouter();

async function fetchLogs() {
  try {
    // ◀── use `api`, not plain `axios`, and drop the extra “/api” prefix
    const { data } = await api.get('/audit-logs');
    logs.value = data;
  } catch (err) {
    // If it’s a 401, clear token and redirect to login
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      router.push({ name: 'Login' });
      return;
    }
    error.value = 'Failed to load audit logs: ' + (err.response?.data?.message || err.message);
  }
}

onMounted(fetchLogs);
</script>

<style scoped>
/* (any component-specific styles remain unchanged) */
</style>
