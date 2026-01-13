<!-- src/views/auth/LoginView.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <form
      @submit.prevent="handleSubmit"
      class="w-full max-w-md bg-white rounded-lg shadow p-6 space-y-6"
    >
      <!-- Brand -->
      <div class="flex flex-col items-center space-y-2 -mt-1 mb-1">
        <img :src="logo" alt="MConnect" class="h-20 sm:h-24 w-auto" />
        <div class="text-base sm:text-lg font-semibold text-gray-900">Staff Login</div>
        <p class="text-xs text-gray-500">Sign in to continue</p>
      </div>

      <!-- Email -->
      <div class="space-y-1">
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          v-model.trim="email"
          type="email"
          required
          autocomplete="username"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <!-- Password (with eye icon) -->
      <div class="space-y-1">
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>

        <div class="relative">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
            autocomplete="current-password"
            class="w-full px-4 py-2 pr-12 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="button"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            :title="showPassword ? 'Hide password' : 'Show password'"
            @click="togglePassword"
            @keydown.enter.prevent="togglePassword"
            @keydown.space.prevent="togglePassword"
          >
            <!-- Eye (show) -->
            <svg
              v-if="!showPassword"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="h-5 w-5"
            >
              <path
                d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"
              />
              <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
            </svg>

            <!-- Eye-slash (hide) -->
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="h-5 w-5"
            >
              <path
                d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l2.02 2.02C2.56 7.14 2 8.63 2 8.63S5 15.5 12 15.5c1.38 0 2.63-.27 3.74-.67l2.73 2.73a.75.75 0 1 0 1.06-1.06l-18-18Zm7.72 10.9-2.7-2.7a3 3 0 0 1 4.2 4.2Zm.75-9.87c7 0 10 6.87 10 6.87s-1.02 2.34-3.23 4.2l-2.13-2.13a5 5 0 0 0-6.94-6.94L7.5 4.32c1.35-.52 2.9-.82 4.5-.82Zm-1.1 3.04a3.5 3.5 0 0 1 4.56 4.56l-4.56-4.56Z"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-2">
        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center px-6 py-2 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 disabled:opacity-50"
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
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

const router = useRouter()
const { login } = useAuth()

function togglePassword() {
  showPassword.value = !showPassword.value
}

async function handleSubmit() {
  loading.value = true
  error.value = ''

  let user
  try {
    user = await login(email.value, password.value)
  } catch (e) {
    error.value =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      'Invalid credentials'
    loading.value = false
    return
  }

  // Redirect based on role
  try {
    const role = String(user?.role_name || '').toUpperCase()

    // ✅ CSR must land on signup-requests page
    if (role === 'CSR') {
      await router.replace({ name: 'CSRSignupRequests' })
    } else {
      await router.replace({ name: 'AdminDashboard' })
    }
  } catch (e) {
    // If redirect fails, do NOT show "Invalid credentials" (login succeeded)
    error.value = `Login succeeded, but redirect failed: ${e?.message || e}`
  } finally {
    loading.value = false
  }
}
</script>
