// src/components/ui/AuditViewer.vue
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const logs = ref([]);

async function fetchLogs() {
  const { data } = await axios.get('/api/audit-logs');
  logs.value = data;
}

onMounted(fetchLogs);
</script>

<style scoped>
/* Add any component-specific styles here */
</style>