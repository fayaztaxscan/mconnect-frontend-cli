import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/index.css';

createApp(App).use(router).mount('#app');

/* router/index.js */
import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/auth/LoginView.vue';
import AdminDashboard from '@/views/dashboard/AdminDashboard.vue';
import CSRDashboard from '@/views/dashboard/CSRDashboard.vue';
import SalesDashboard from '@/views/dashboard/SalesDashboard.vue';
import RewardRedemption from '@/views/dashboard/RewardRedemption.vue';
import ReportsView from '@/views/dashboard/ReportsView.vue';
import SettingsView from '@/views/settings/SettingsView.vue';
import ProtectedRoute from '@/components/layout/ProtectedRoute.vue';

const routes = [
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/', redirect: '/login' },
  {
    path: '/',
    component: ProtectedRoute,
    children: [
      { path: 'admin', name: 'AdminDashboard', component: AdminDashboard },
      { path: 'csr', name: 'CSRDashboard', component: CSRDashboard },
      { path: 'sales', name: 'SalesDashboard', component: SalesDashboard },
      { path: 'rewards', name: 'RewardRedemption', component: RewardRedemption },
      { path: 'reports', name: 'ReportsView', component: ReportsView },
      { path: 'settings', name: 'SettingsView', component: SettingsView }
    ]
  }
];

export default createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});