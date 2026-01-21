<!-- src/views/users/ManageUsersView.vue -->
<template>
  <div class="max-w-6xl mx-auto p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Manage Users</h1>
      <router-link
        :to="{ name: 'AddUser' }"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
      >
        New User
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-8 text-gray-500">
      Loading users…
    </div>

    <div v-else-if="error" class="p-4 rounded bg-red-50 text-red-700 border border-red-200">
      {{ error }}
    </div>

    <div v-else class="overflow-x-auto bg-white border rounded">
      <table class="min-w-full border-collapse text-sm">
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
          <tr v-if="users.length === 0">
            <td colspan="6" class="px-4 py-6 text-center text-gray-400">
              No users found.
            </td>
          </tr>

          <tr
            v-for="user in users"
            :key="user.id"
            class="hover:bg-gray-50"
          >
            <td class="px-4 py-2 border">{{ user.display_name || user.name || '—' }}</td>
            <td class="px-4 py-2 border">{{ user.email || '—' }}</td>
            <td class="px-4 py-2 border">{{ user.role_name || user.role || '—' }}</td>
            <td class="px-4 py-2 border">{{ user.region_name || user.region || '—' }}</td>
            <td class="px-4 py-2 border">{{ user.dealer_name || '—' }}</td>
            <td class="px-4 py-2 border space-x-2">
              <router-link
                :to="{ name: 'UserDetails', params: { id: user.id } }"
                class="text-blue-600 hover:underline"
              >
                View
              </router-link>

              <button
                @click="editUser(user.id)"
                class="text-green-600 hover:underline"
                type="button"
              >
                Edit
              </button>

              <button
                @click="deleteUser(user.id)"
                class="text-red-600 hover:underline"
                type="button"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const users = ref([])
const loading = ref(true)
const error = ref('')
const router = useRouter()

function unwrapList(payload) {
  // Supports:
  // 1) payload is array
  // 2) payload is { data: [] }
  // 3) payload is { success: true, data: [] }
  const list = payload?.data ?? payload
  return Array.isArray(list) ? list : []
}

async function loadUsers() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/users')
    users.value = unwrapList(res.data)
  } catch (err) {
    console.error('Failed to load users', err)
    users.value = []
    error.value = err?.response?.data?.message || err?.message || 'Could not load users'
  } finally {
    loading.value = false
  }
}

function editUser(id) {
  router.push({ name: 'EditUser', params: { id } })
}

async function deleteUser(id) {
  if (!confirm('Are you sure you want to delete this user?')) return
  try {
    await api.delete(`/users/${id}`)
    await loadUsers()
  } catch (err) {
    console.error('Delete failed', err)
    alert(err?.response?.data?.message || err?.response?.data?.error || 'Could not delete user')
  }
}

onMounted(loadUsers)
</script>
