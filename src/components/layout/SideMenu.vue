<!-- src/components/layout/SideMenu.vue -->
<template>
  <aside class="w-64 bg-white text-slate-800 flex flex-col h-screen border-r border-slate-200">
    <!-- Header -->
    <div class="px-4 py-4 border-b border-slate-200 flex items-center justify-between">
      <router-link to="/" class="flex items-center gap-3">
        <img :src="logo" alt="MConnect" class="h-12 w-auto sm:h-14" />
        <span class="sr-only">MConnect</span>
      </router-link>
      <NotificationDropdown v-if="showNotifications" />
    </div>

    <!-- Region switcher — Admin / SuperAdmin only -->
    <div v-if="isAdmin" class="px-3 py-2 border-b border-slate-100 bg-slate-50">
      <div class="flex items-center gap-1.5">
        <span class="text-[11px] text-slate-500 whitespace-nowrap">Viewing:</span>
        <select
          v-model="selectedRegionId"
          @change="onRegionChange"
          :disabled="switching"
          :class="['flex-1 text-xs border rounded px-1.5 py-1 bg-white text-slate-700 min-w-0', switching ? 'opacity-50 cursor-wait' : '']"
        >
          <option :value="null">All Regions</option>
          <option v-for="r in regions" :key="r.id" :value="r.id">
            {{ r.name }} ({{ r.country_code }})
          </option>
        </select>
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto">
      <ul class="mt-2">

        <!-- ✅ CSR -->
        <template v-if="isCSR">
          <li class="mb-1">
            <router-link
              :to="{ name: 'CSRSignupRequests' }"
              class="flex items-center justify-between px-4 py-3 rounded-md hover:bg-slate-100"
              :class="{ 'bg-indigo-50 text-indigo-700 font-medium': route.name === 'CSRSignupRequests' }"
            >
              <span class="font-medium">Verify & Map</span>
              <svg class="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
          </li>
        </template>

        <!-- ✅ BDM -->
        <template v-else-if="isBDM">
          <li class="mb-1">
            <router-link
              :to="{ name: 'BDMRequests' }"
              class="flex items-center justify-between px-4 py-3 rounded-md hover:bg-slate-100"
              :class="{ 'bg-indigo-50 text-indigo-700 font-medium': route.name === 'BDMRequests' }"
            >
              <span class="font-medium">Approvals</span>
              <svg class="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
          </li>
          <li class="mb-1">
            <router-link
              :to="{ name: 'BDMActivity' }"
              class="flex items-center justify-between px-4 py-3 rounded-md hover:bg-slate-100"
              :class="{ 'bg-indigo-50 text-indigo-700 font-medium': route.name === 'BDMActivity' }"
            >
              <span class="font-medium">Activity History</span>
              <svg class="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
          </li>
        </template>

        <!-- ✅ ADMIN / SUPER ADMIN -->
        <template v-else>
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
              <li><router-link :to="{ name: 'FulfillClaims' }" class="block px-8 py-2 hover:bg-slate-100">Fulfill Claims</router-link></li>
              <li><router-link :to="{ name: 'ManageRewardCategories' }" class="block px-8 py-2 hover:bg-slate-100">Categories</router-link></li>
              <li><router-link :to="{ name: 'ManageRewardItems' }" class="block px-8 py-2 hover:bg-slate-100">Items</router-link></li>
            </ul>
          </li>

          <!-- Signup Pipeline -->
          <li class="mb-1">
            <div
              @click="toggle('Pipeline')"
              class="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-100"
              :class="{ 'bg-indigo-50 text-indigo-700': activeSection === 'Pipeline' }"
            >
              <span class="font-medium">Signup Pipeline</span>
              <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-90': activeSection === 'Pipeline' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
            <ul v-if="activeSection === 'Pipeline'" class="bg-slate-50 border-t border-slate-200">
              <li><router-link :to="{ name: 'PipelineMonitor' }" class="block px-8 py-2 hover:bg-slate-100">Pipeline Monitor</router-link></li>
              <li><router-link :to="{ name: 'UTMAnalytics' }" class="block px-8 py-2 hover:bg-slate-100">UTM Analytics</router-link></li>
            </ul>
          </li>

          <!-- Brands -->
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

          <!-- Divisions -->
          <li class="mb-1">
            <router-link
              :to="{ name: 'DivisionsList' }"
              class="flex items-center justify-between px-4 py-3 rounded-md hover:bg-slate-100"
              :class="{ 'bg-indigo-50 text-indigo-700 font-medium': isDivisionActive }"
            >
              <span class="font-medium">Divisions</span>
              <svg class="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
          </li>

          <!-- Categories -->
          <li class="mb-1">
            <router-link
              :to="{ name: 'CategoriesList' }"
              class="flex items-center justify-between px-4 py-3 rounded-md hover:bg-slate-100"
              :class="{ 'bg-indigo-50 text-indigo-700 font-medium': isCategoryActive }"
            >
              <span class="font-medium">Categories</span>
              <svg class="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
          </li>

          <!-- Products -->
          <li class="mb-1">
            <router-link
              :to="{ name: 'ProductList' }"
              class="flex items-center justify-between px-4 py-3 rounded-md hover:bg-slate-100"
              :class="{ 'bg-indigo-50 text-indigo-700 font-medium': isProductActive }"
            >
              <span class="font-medium">Products</span>
              <svg class="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
          </li>

          <!-- Dealers -->
          <li class="mb-1">
            <router-link
              :to="{ name: 'DealersList' }"
              class="flex items-center justify-between px-4 py-3 rounded-md hover:bg-slate-100"
              :class="{ 'bg-indigo-50 text-indigo-700 font-medium': isDealerActive }"
            >
              <span class="font-medium">Dealers</span>
              <svg class="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
          </li>

          <!-- Shops -->
          <li class="mb-1">
            <router-link
              :to="{ name: 'ShopsList' }"
              class="flex items-center justify-between px-4 py-3 rounded-md hover:bg-slate-100"
              :class="{ 'bg-indigo-50 text-indigo-700 font-medium': isShopActive }"
            >
              <span class="font-medium">Shops</span>
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
            </ul>
          </li>
        </template>

      </ul>
    </nav>

    <!-- Footer -->
    <div class="px-4 py-4 border-t border-slate-200 bg-white">
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
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useRegionStore } from '@/store/regionStore'
import { useRegions } from '@/composables/useRegions'
import NotificationDropdown from '@/components/layout/NotificationDropdown.vue'
import logo from '@/assets/mconnect_logo.png'

const router = useRouter()
const route = useRoute()
const auth = useAuth()
const { logout } = auth
const regionStore = useRegionStore()
const { regions, fetchRegions } = useRegions()

const activeSection = ref('')

// role helpers
const roleName = computed(() => String(auth.currentUser.value?.role_name || '').toUpperCase().replace(/\s+/g, ''))
const isCSR = computed(() => roleName.value === 'CSR')
const isBDM = computed(() => roleName.value === 'BDM')
const isAdmin = computed(() => roleName.value === 'ADMIN' || roleName.value === 'SUPERADMIN')

// region switcher
const switching = ref(false)
const selectedRegionId = computed({
  get: () => regionStore.selectedRegionId,
  set: (val) => {
    const region = val == null ? null : (regions.value.find(r => r.id === val) ?? null)
    regionStore.setRegion(region)
  }
})

async function onRegionChange() {
  switching.value = true
  const region = selectedRegionId.value == null
    ? null
    : (regions.value.find(r => r.id === selectedRegionId.value) ?? null)
  regionStore.setRegion(region)
  await new Promise(r => setTimeout(r, 100))
  switching.value = false
}

// Load regions for the switcher when admin is logged in
watch(isAdmin, (val) => { if (val) fetchRegions() }, { immediate: true })

// If you want notif bell only for admin for now:
const showNotifications = computed(() => !isCSR.value && !isBDM.value)

// Active states
const brandRouteNames = ['BrandsList', 'BrandCreate', 'BrandEdit']
const divisionRouteNames = ['DivisionsList', 'DivisionCreate', 'DivisionEdit']
const categoryRouteNames = ['CategoriesList', 'CategoryCreate', 'CategoryEdit']
const productRouteNames = ['ProductList', 'CreateProduct', 'EditProduct', 'ProductDetails']
const dealerRouteNames = ['DealersList', 'AddDealer', 'EditDealer', 'DealerDetails']
const shopRouteNames = ['ShopsList', 'AddShop', 'EditShop', 'ShopDetails']

const isBrandActive = computed(() => brandRouteNames.includes(route.name))
const isDivisionActive = computed(() => divisionRouteNames.includes(route.name))
const isCategoryActive = computed(() => categoryRouteNames.includes(route.name))
const isProductActive = computed(() => productRouteNames.includes(route.name))
const isDealerActive = computed(() => dealerRouteNames.includes(route.name))
const isShopActive = computed(() => shopRouteNames.includes(route.name))

function setActive() {
  const name = route.name

  if (
    [
      'FulfillClaims','ManageRewardCategories','AddRewardCategory','ViewRewardCategory','EditRewardCategory',
      'ManageRewardItems','CreateRewardItem','ViewRewardItem','EditRewardItem'
    ].includes(name)
  ) {
    activeSection.value = 'Rewards'
  } else if (
    ['NotificationsView','AuditLogs','ManageUsers','AddUser','EditUser','UserDetails'].includes(name)
  ) {
    activeSection.value = 'Settings'
  } else if (
    ['PipelineMonitor','UTMAnalytics'].includes(name)
  ) {
    activeSection.value = 'Pipeline'
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
