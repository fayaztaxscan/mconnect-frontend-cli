<template>
  <div class="relative">
    <button @click="toggleDropdown" class="text-white relative">
      🔔
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-2 bg-red-600 text-xs font-semibold px-1.5 py-0.5 rounded-full"
      >
        {{ unreadCount }}
      </span>
    </button>

    <transition name="fade">
         <div
            v-if="open"
            class="fixed top-14 right-6 sm:right-10 w-72 bg-white text-black shadow-xl rounded z-50"
        >

        <div class="px-4 py-2 font-semibold border-b">Notifications</div>
        <ul>
            <li
                v-for="note in notifications"
                :key="note.id"
                class="px-4 py-2 border-b text-sm cursor-pointer"
                :class="{ 'text-gray-400 italic': note.is_read }"
                @click="markAsRead(note)"
                >
                {{ note.message }}
                <div class="text-xs text-gray-500">
                    {{ formatDate(note.created_at) }}
                </div>
                </li>

            <li v-if="notifications.length === 0" class="text-gray-400 px-4 py-2">No notifications</li>
        </ul>
        </div>
    </transition>
    </div>

</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from '@/services/api';

const open = ref(false);
const notifications = ref([]);

const toggleDropdown = async () => {
  open.value = !open.value;
  if (open.value) {
    try {
      const res = await axios.get('/notifications');
      notifications.value = res.data;
    } catch (err) {
      console.error('Notification fetch failed', err);
    }
  }
};

const markAsRead = async (note) => {
  if (note.is_read) return;

  try {
    await axios.post(`/notifications/${note.id}/read`);
    note.is_read = 1;
  } catch (err) {
    console.error('Failed to mark notification as read', err);
  }
};


const unreadCount = computed(() =>
  notifications.value.filter(n => !n.is_read).length
);

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

 <style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
