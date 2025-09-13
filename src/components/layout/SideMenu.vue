<!-- src/components/layout/SideMenu.vue -->
<template>
  <!-- Light, pleasant sidebar -->
  <aside class="w-64 bg-white text-slate-800 flex flex-col h-screen border-r border-slate-200">
    <!-- Header: larger logo at left, bell at right -->
    <div class="px-4 py-4 border-b border-slate-200 flex items-center justify-between">
      <router-link to="/" class="flex items-center gap-3">
        <img :src="logo" alt="MConnect" class="h-12 w-auto sm:h-14" />
        <span class="sr-only">MConnect</span>
      </router-link>
      <NotificationDropdown />
    </div>

    <nav class="flex-1 overflow-y-auto">
      <ul class="mt-2">
        <!-- Rewards -->
        <li class="mb-1">
          <div
            @click="toggle('Rewards')"
            class="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-100"
            :class="{ 'bg-indigo-50 text-indigo-700': activeSection === 'Rewards' }"
          >
            <span class="font-medium">Rewards</span>
            <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-90': activeSection === 'Rewards' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
          <ul v-if="activeSection === 'Rewards'" class="bg-slate-50 border-t border-slate-200">
            <li>
              <router-link :to="{ name: 'FulfillClaims' }" class="block px-8 py-2 hover:bg-slate-100">Fulfill Claims</router-link>
            </li>
            <li>
              <router-link :to="{ name: 'ManageRewardCategories' }" class="block px-8 py-2 hover:bg-slate-100">Categories</router-link>
            </li>
            <li>
              <router-link :to="{ name: 'ManageRewardItems' }" class="block px-8 py-2 hover:bg-slate-100">Items</router-link>
            </li>
          </ul>
        </li>

        <!-- Top-level: Brands -->
        <li class="mb-1">
          <router-link
            :to="{ name: 'BrandsList' }"
            class="flex items-center justify-between px-4 py-3 rounded-md hover:bg-slate-100"
            :class="{ 'bg-indigo-50 text-indigo-700 font-medium': isBrandActive }"
          >
            <span class="font-medium">Brands</span>
            <svg class="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>
        </li>

        <!-- Settings -->
        <li class="mb-1">
          <div
            @click="toggle('Settings')"
            class="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-100"
            :class="{ 'bg-indigo-50 text-indigo-700': activeSection === 'Settings' }"
          >
            <span class="font-medium">Settings</span>
            <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-90': activeSection === 'Settings' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
          <ul v-if="activeSection === 'Settings'" class="bg-slate-50 border-t border-slate-200">
            <li><router-link :to="{ name: 'NotificationsView' }" class="block px-8 py-2 hover:bg-slate-100">Notifications</router-link></li>
            <li><router-link :to="{ name: 'AuditLogs' }" class="block px-8 py-2 hover:bg-slate-100">Audit Logs</router-link></li>
            <li><router-link :to="{ name: 'ManageUsers' }" class="block px-8 py-2 hover:bg-slate-100">Users</router-link></li>
            <li><router-link :to="{ name: 'DealersList' }" class="block px-8 py-2 hover:bg-slate-100">Dealers</router-link></li>
            <li><router-link :to="{ name: 'ShopsList' }" class="block px-8 py-2 hover:bg-slate-100">Shops</router-link></li>
          </ul>
        </li>
      </ul>
    </nav>

    <div class="px-4 py-4 border-t border-slate-200 bg-white">
      <button @click="logoutAndGoLogin" class="w-full text-left px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white">
        Logout
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import NotificationDropdown from '@/components/layout/NotificationDropdown.vue'
import logo from '@/assets/mconnect_logo.png'

const router        = useRouter()
const route         = useRoute()
const { logout }    = useAuth()
const activeSection = ref('')

// brand active state (top-level)
const brandRouteNames = ['BrandsList', 'BrandCreate', 'BrandEdit']
const isBrandActive = computed(() => brandRouteNames.includes(route.name))

function setActive() {
  const name = route.name
  if (
    ['FulfillClaims','ManageRewardCategories','AddRewardCategory','ViewRewardCategory','EditRewardCategory',
     'ManageRewardItems','AddRewardItem','ViewRewardItem','EditRewardItem'].includes(name)
  ) {
    activeSection.value = 'Rewards'
  } else if (
    ['NotificationsView','AuditLogs','ManageUsers','AddUser','EditUser','UserDetails',
     'DealersList','AddDealer','EditDealer','DealerDetails',
     'ShopsList','AddShop','EditShop','ShopDetails'].includes(name)
  ) {
    activeSection.value = 'Settings'
  } else {
    activeSection.value = ''
  }
}
onMounted(setActive)
watch(() => route.name, setActive)

function toggle(section) {
  activeSection.value = activeSection.value === section ? '' : section
}
function logoutAndGoLogin() {
  logout()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
/* Styling handled via Tailwind */
</style>
