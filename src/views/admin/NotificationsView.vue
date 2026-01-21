<!-- src/views/admin/NotificationsView.vue -->
<template>
  <div class="p-4 max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">Admin Notifications</h1>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="px-3 py-2 rounded bg-white border hover:bg-gray-50 text-sm"
          @click="fetchNotifications"
          :disabled="loading"
        >
          Refresh
        </button>

        <button
          type="button"
          class="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
          @click="markAllRead"
          :disabled="loading || notifications.length === 0"
          title="Works only if backend supports it"
        >
          Mark all read
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-10 text-gray-500">
      Loading notifications…
    </div>

    <div
      v-else-if="error"
      class="p-4 rounded bg-red-50 text-red-700 border border-red-200"
    >
      {{ error }}
    </div>

    <div v-else-if="notifications.length === 0" class="text-center py-10 text-gray-400">
      No notifications found.
    </div>

    <div v-else class="bg-white border rounded overflow-x-auto">
      <table class="min-w-full text-sm border-collapse">
        <thead class="bg-gray-50 text-left">
          <tr>
            <th class="px-4 py-3 border-b w-[55%]">Message</th>
            <th class="px-4 py-3 border-b w-[15%]">Type</th>
            <th class="px-4 py-3 border-b w-[12%]">Status</th>
            <th class="px-4 py-3 border-b w-[14%]">Date</th>
            <th class="px-4 py-3 border-b w-[4%]">Action</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="note in notifications" :key="note.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 border-b">
              <div class="flex items-start gap-2">
                <span
                  class="mt-1 inline-block h-2 w-2 rounded-full"
                  :class="note.is_read ? 'bg-green-500' : 'bg-orange-500'"
                />
                <div>
                  <div class="font-medium text-gray-900">
                    {{ note.message || '—' }}
                  </div>
                  <div class="text-xs text-gray-500">
                    ID: {{ note.id }}
                  </div>
                </div>
              </div>
            </td>

            <td class="px-4 py-3 border-b">
              {{ note.type || '—' }}
            </td>

            <td class="px-4 py-3 border-b">
              <span
                class="px-2 py-1 rounded text-xs font-medium"
                :class="note.is_read ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
              >
                {{ note.is_read ? 'Read' : 'Unread' }}
              </span>
            </td>

            <td class="px-4 py-3 border-b text-gray-600">
              {{ formatDate(note.created_at) }}
            </td>

            <td class="px-4 py-3 border-b">
              <button
                type="button"
                class="text-blue-600 hover:underline text-sm"
                @click="toggleRead(note)"
              >
                {{ note.is_read ? 'Unread' : 'Read' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-3 text-xs text-gray-500">
      Tip: Unread items show an orange dot.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const notifications = ref([])
const loading = ref(true)
const error = ref('')

function unwrapList(payload) {
  // Supports:
  // A) payload is array  ✅ (your /notifications)
  // B) payload is { data: [] } ✅ (your /users)
  const list = payload?.data ?? payload
  return Array.isArray(list) ? list : []
}

function formatDate(dt) {
  if (!dt) return '—'
  try {
    return new Date(dt).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return String(dt)
  }
}

async function fetchNotifications() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/notifications')
    notifications.value = unwrapList(res.data)
  } catch (err) {
    console.error('Failed to load notifications:', err)
    notifications.value = []
    error.value =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      'Failed to load notifications'
  } finally {
    loading.value = false
  }
}

/**
 * Optional: only works if backend supports it.
 * If you don't have this endpoint, you can remove this function/button.
 */
async function markAllRead() {
  try {
    await api.patch('/notifications/read-all')
    notifications.value = notifications.value.map(n => ({ ...n, is_read: 1 }))
  } catch (err) {
    console.warn('markAllRead not available:', err)
    alert('Mark-all endpoint not available yet.')
  }
}

/**
 * Optional: only works if backend supports it.
 * If you don't have this endpoint, you can remove this function/button.
 */
async function toggleRead(note) {
  const next = note.is_read ? 0 : 1
  try {
    await api.patch(`/notifications/${note.id}`, { is_read: next })
    note.is_read = next
  } catch (err) {
    console.warn('toggleRead not available:', err)
    alert('Mark read/unread endpoint not available yet.')
  }
}

onMounted(fetchNotifications)
</script>
