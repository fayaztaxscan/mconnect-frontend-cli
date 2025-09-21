<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <form @submit.prevent="handleSubmit" class="w-full max-w-md bg-white rounded-lg shadow p-6 space-y-6">
      <!-- App brand -->
      <div class="flex flex-col items-center space-y-2 -mt-1 mb-1">
        <img :src="logo" alt="MConnect" class="h-20 sm:h-24 w-auto" />
        <!-- <h1 class="text-lg sm:text-xl font-semibold text-gray-900">MKonnect</h1> -->
        <p class="text-xs text-gray-500">Sign in to continue</p>
      </div>

      <div class="space-y-1">
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          autocomplete="username"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div class="space-y-1">
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div class="space-y-2">
        <button
          type="submit"
          :disabled="loading"
          class="w-full sm:w-auto flex justify-center px-6 py-2 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {{ loading ? 'Logging in…' : 'Login' }}
        </button>

        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import logo from '@/assets/mconnect_logo.png'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const router = useRouter()
const { login } = useAuth()  // expects login(email, password) per the service we added

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    await login(email.value, password.value)     // ← calls src/services/auth.js under the hood
    router.push({ name: 'AdminDashboard' })
  } catch (e) {
    error.value = e?.response?.data?.error || 'Invalid credentials'
    // optional: console.error(e)
  } finally {
    loading.value = false
  }
}
</script>
