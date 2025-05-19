<template>
  <aside class="w-64 bg-gray-800 text-gray-100 flex flex-col h-screen">
    <div class="px-4 py-6 text-lg font-semibold border-b border-gray-700">
      Admin Menu
    </div>
    <nav class="flex-1 overflow-y-auto">
      <ul class="mt-2">
        <li v-for="item in menuItems" :key="item.name" class="mb-1">
          <div
            @click="selectMenu(item)"
            :class="[
              'flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-700',
              { 'bg-gray-700': activeSection === item.name }
            ]"
          >
            <span>{{ item.label }}</span>
            <svg
              v-if="item.children"
              :class="['w-4 h-4 transition-transform', { 'rotate-90': activeSection === item.name }]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <ul v-if="item.children && activeSection === item.name" class="bg-gray-700">
            <li v-for="sub in item.children" :key="sub.name">
              <router-link
                :to="sub.to"
                class="block px-8 py-2 text-gray-200 hover:bg-gray-600"
                active-class="bg-gray-600 text-white"
              >
                {{ sub.label }}
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
    <div class="px-4 py-4 border-t border-gray-700">
      <button @click="logoutAndGoLogin" class="w-full text-left px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white">
        Logout
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const route = useRoute();
const { logout } = useAuth();

const menuItems = [
  { name: 'AdminDashboard', label: 'Dashboard', to: { name: 'AdminDashboard' } },
  { name: 'CSRDashboard',   label: 'CSR',       to: { name: 'CSRDashboard' } },
  {
    name: 'Sales', label: 'Sales', children: [
      { name: 'SalesDashboard',  label: 'Sales Dashboard', to: { name: 'SalesDashboard' } },
      { name: 'SalesEntry',      label: 'New Entry',       to: { name: 'SalesEntry' } },
      { name: 'BulkUpload',      label: 'Bulk Upload',     to: { name: 'BulkUpload' } },
      { name: 'ProductList',     label: 'Catalogue',       to: { name: 'ProductList' } },
      { name: 'CreateProduct',   label: 'New Product',     to: { name: 'CreateProduct' } },
      { name: 'CategoryList',    label: 'Categories',      to: { name: 'CategoryList' } },
      { name: 'CreateCategory',  label: 'New Category',    to: { name: 'CreateCategory' } }
    ]
  },
  {
    name: 'Rewards', label: 'Rewards', children: [
      { name: 'RewardRedemption',       label: 'Redemption',         to: { name: 'RewardRedemption' } },
      { name: 'RewardDashboard',        label: 'Dashboard',          to: { name: 'RewardDashboard' } },
      { name: 'ManageRewardItems',      label: 'Manage Reward Items', to: { name: 'ManageRewardItems' } },
      { name: 'ManageRewardCategories', label: 'Reward Categories',   to: { name: 'ManageRewardCategories' } }
    ]
  },
  { name: 'ReportsView', label: 'Reports', to: { name: 'ReportsView' } },
  {
    name: 'Settings', label: 'Settings', children: [
      { name: 'SettingsView', label: 'General Settings', to: { name: 'SettingsView' } },
      { name: 'AuditLogs',    label: 'Audit Logs',       to: { name: 'AuditLogs' } },
      { name: 'ManageUsers',  label: 'Manage Users',     to: { name: 'ManageUsers' } }
    ]
  }
];

const activeSection = ref('AdminDashboard');

function setActiveByRoute() {
  menuItems.forEach(item => {
    if (item.children) {
      if (item.children.some(sub => route.name === sub.name)) {
        activeSection.value = item.name;
      }
    } else if (route.name === item.name) {
      activeSection.value = item.name;
    }
  });
}

setActiveByRoute();
watch(() => route.name, setActiveByRoute);

function selectMenu(item) {
  activeSection.value = item.name;
  if (item.to) router.push(item.to);
}

function logoutAndGoLogin() {
  logout();
  router.push({ name: 'Login' });
}
</script>

<style scoped>
/* util-class driven—no extra CSS needed */
</style>
