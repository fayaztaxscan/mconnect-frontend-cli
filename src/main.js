import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/index.css';

createApp(App).use(router).mount('#app');

/* router/index.js */
import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import AdminDashboard from '@/views/AdminDashboard.vue';
import CSRDashboard from '@/views/CSRDashboard.vue';
import SalesDashboard from '@/views/SalesDashboard.vue';
import RewardRedemption from '@/views/RewardRedemption.vue';
import ReportsView from '@/views/ReportsView.vue';
import SettingsView from '@/views/SettingsView.vue';
import ProtectedRoute from '@/components/ProtectedRoute.vue';

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