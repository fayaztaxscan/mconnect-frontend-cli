<template>
  <div>
    <nav v-if="isLoggedIn" class="bg-gray-800 text-white p-4 flex space-x-4">
      <router-link to="/admin">Dashboard</router-link>
      <router-link to="/csr">CSR</router-link>
      <router-link to="/sales">Sales</router-link>
      <router-link to="/rewards">Rewards</router-link>
      <router-link to="/reports">Reports</router-link>
      <router-link to="/settings">Settings</router-link>

      <div class="ml-auto flex items-center space-x-2">
        <button @click="logoutAndGoLogin" class="px-2 py-1 bg-red-600 rounded">
          Logout
        </button>
      </div>
    </nav>

    <!-- this is where the child routes will render -->
    <router-view />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuth }   from '@/composables/useAuth';
import UserMenu      from '@/components/UserMenu.vue';

const { isLoggedIn, logout } = useAuth();
const router = useRouter();

function logoutAndGoLogin() {
  logout();
  router.push({ name: 'Login' });
}
</script>
