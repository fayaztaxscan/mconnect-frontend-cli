<!-- src/components/layout/ProtectedRoute.vue -->
<template>
  <!-- CSR layout: no SideMenu, show simple header + logout -->
  <div v-if="isCSR" class="min-h-screen bg-gray-100">
    <header class="h-14 bg-white border-b flex items-center justify-between px-4">
      <div class="font-semibold text-gray-800">
        Signup Requests
      </div>

      <button
        type="button"
        class="px-3 py-1.5 rounded bg-red-600 text-white text-sm hover:bg-red-700"
        @click="handleLogout"
      >
        Logout
      </button>
    </header>

    <main class="min-h-[calc(100vh-56px)]">
      <router-view />
    </main>
  </div>

  <!-- Non-CSR layout: normal SideMenu -->
  <div v-else class="flex min-h-screen">
    <SideMenu />
    <main class="flex-1 bg-gray-100">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import SideMenu from './SideMenu.vue'

const router = useRouter()
const auth = useAuth()

function getCachedRole() {
  try {
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    return u?.role_name || u?.role || ''
  } catch {
    return ''
  }
}

const isCSR = computed(() => {
  const role = auth.currentUser.value?.role_name || auth.currentUser.value?.role || getCachedRole()
  return String(role || '').toUpperCase() === 'CSR'
})

function handleLogout() {
  auth.logout()
  router.replace({ name: 'Login' })
}
</script>
