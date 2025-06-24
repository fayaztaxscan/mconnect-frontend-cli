<!-- src/components/layout/SideMenu.vue -->
<template>
  <aside class="w-64 bg-gray-800 text-gray-100 flex flex-col h-screen">
    <div class="px-4 py-6 text-lg font-semibold border-b border-gray-700">
      Admin Menu
    </div>

    <nav class="flex-1 overflow-y-auto">
      <ul class="mt-2">
        <!-- Rewards -->
        <li class="mb-1">
          <div
            @click="toggle('Rewards')"
            class="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-700"
            :class="{ 'bg-gray-700': activeSection === 'Rewards' }"
          >
            <span>Rewards</span>
            <svg
              class="w-4 h-4 transition-transform"
              :class="{ 'rotate-90': activeSection === 'Rewards' }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5l7 7-7 7"/>
            </svg>
          </div>
          <ul v-if="activeSection === 'Rewards'" class="bg-gray-700">
            <li>
              <router-link
                :to="{ name: 'ManageRewardCategories' }"
                class="block px-8 py-2 hover:bg-gray-600"
              >Categories</router-link>
            </li>
            <li>
              <router-link
                :to="{ name: 'ManageRewardItems' }"
                class="block px-8 py-2 hover:bg-gray-600"
              >Items</router-link>
            </li>
          </ul>
        </li>

        <!-- Settings (without "General") -->
        <li class="mb-1">
          <div
            @click="toggle('Settings')"
            class="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-700"
            :class="{ 'bg-gray-700': activeSection === 'Settings' }"
          >
            <span>Settings</span>
            <svg
              class="w-4 h-4 transition-transform"
              :class="{ 'rotate-90': activeSection === 'Settings' }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5l7 7-7 7"/>
            </svg>
          </div>
          <ul v-if="activeSection === 'Settings'" class="bg-gray-700">
            <li>
              <router-link
                :to="{ name: 'AuditLogs' }"
                class="block px-8 py-2 hover:bg-gray-600"
              >Audit Logs</router-link>
            </li>
            <li>
              <router-link
                :to="{ name: 'ManageUsers' }"
                class="block px-8 py-2 hover:bg-gray-600"
              >Users</router-link>
            </li>
            <li>
              <router-link
                :to="{ name: 'DealersList' }"
                class="block px-8 py-2 hover:bg-gray-600"
              >Dealers</router-link>
            </li>
            <li>
              <router-link
                :to="{ name: 'ShopsList' }"
                class="block px-8 py-2 hover:bg-gray-600"
              >Shops</router-link>
            </li>
          </ul>
        </li>
      </ul>
    </nav>

    <div class="px-4 py-4 border-t border-gray-700">
      <button
        @click="logoutAndGoLogin"
        class="w-full text-left px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white"
      >
        Logout
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const router        = useRouter();
const route         = useRoute();
const { logout }    = useAuth();
const activeSection = ref('');

// map active route to section
function setActive() {
  const name = route.name;
  if (
    ['ManageRewardCategories','AddRewardCategory','ViewRewardCategory','EditRewardCategory',
     'ManageRewardItems','AddRewardItem','ViewRewardItem','EditRewardItem']
    .includes(name)
  ) {
    activeSection.value = 'Rewards';
  } else if (
    ['AuditLogs','ManageUsers','AddUser','EditUser','UserDetails',
     'DealersList','AddDealer','EditDealer','DealerDetails',
     'ShopsList','AddShop','EditShop','ShopDetails']
    .includes(name)
  ) {
    activeSection.value = 'Settings';
  } else {
    activeSection.value = '';
  }
}

onMounted(setActive);
watch(() => route.name, setActive);

function toggle(section) {
  activeSection.value = activeSection.value === section ? '' : section;
}

function logoutAndGoLogin() {
  logout();
  router.push({ name: 'Login' });
}
</script>

<style scoped>
/* All styling via Tailwind */
</style>
