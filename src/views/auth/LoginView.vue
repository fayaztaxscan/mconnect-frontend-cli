<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <form @submit.prevent="handleSubmit" class="w-full max-w-md bg-white rounded-lg shadow p-6 space-y-6">
      <div class="space-y-1">
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
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
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full sm:w-auto flex justify-center px-6 py-2 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 disabled:opacity-50"
      >
        {{ loading ? 'Logging in…' : 'Login' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import { useAuth } from '@/composables/useAuth';

const email = ref('');
const password = ref('');
const loading = ref(false);
const router = useRouter();
const { login } = useAuth();

async function handleSubmit() {
  loading.value = true;
  try {
    const { data } = await api.login({ email: email.value, password: password.value });
    login(data.token);
    router.push({ name: 'AdminDashboard' });
  } catch (err) {
    console.error('Login failed:', err.response?.data || err);
    alert('Login failed: ' + (err.response?.data?.error || err.message));
  } finally {
    loading.value = false;
  }
}
</script>
