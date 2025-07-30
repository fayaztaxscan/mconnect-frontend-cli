<template>
  <div class="p-4 max-w-5xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Admin Notifications</h1>

    <div v-if="loading" class="text-center py-6 text-gray-500">Loading notifications...</div>
    <div v-else-if="notifications.length === 0" class="text-center py-6 text-gray-400">
      No notifications found.
    </div>

    <table v-else class="w-full border border-gray-200 text-sm bg-white">
      <thead class="bg-gray-100 text-left">
        <tr>
          <th class="px-4 py-2 border">Message</th>
          <th class="px-4 py-2 border">Type</th>
          <th class="px-4 py-2 border">Status</th>
          <th class="px-4 py-2 border">Date</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="note in notifications"
          :key="note.id"
          class="hover:bg-gray-50"
        >
          <td class="px-4 py-2 border">{{ note.message }}</td>
          <td class="px-4 py-2 border">{{ note.type || '—' }}</td>
          <td class="px-4 py-2 border">
            <span
              class="px-2 py-1 rounded text-xs font-medium"
              :class="note.is_read ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
            >
              {{ note.is_read ? 'Read' : 'Unread' }}
            </span>
          </td>
          <td class="px-4 py-2 border text-gray-500">{{ formatDate(note.created_at) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '@/services/api';

const notifications = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await axios.get('/notifications');
    notifications.value = res.data;
  } catch (err) {
    console.error('Failed to load notifications:', err);
  } finally {
    loading.value = false;
  }
});

const formatDate = (dt) =>
  new Date(dt).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
</script>
