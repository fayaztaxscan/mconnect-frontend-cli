import { createRouter, createWebHistory } from 'vue-router';
import { useAuth }                        from '@/composables/useAuth';

import LoginView        from '@/views/LoginView.vue';
import ProtectedRoute   from '@/components/ProtectedRoute.vue';
import AdminDashboard   from '@/views/AdminDashboard.vue';
import CSRDashboard     from '@/views/CSRDashboard.vue';
import SalesDashboard   from '@/views/SalesDashboard.vue';
import RewardRedemption from '@/views/RewardRedemption.vue';
import ReportsView      from '@/views/ReportsView.vue';
import SettingsView     from '@/views/SettingsView.vue';
import AddUserView      from '@/views/AddUserView.vue';
import ManageUsersView  from '@/views/ManageUsersView.vue';
import EditUserView     from '@/views/EditUserView.vue';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/',
    component: ProtectedRoute,
    meta: { requiresAuth: true },
    children: [
      { path: '',               redirect: { name: 'AdminDashboard' } },
      { path: 'admin',          name: 'AdminDashboard',   component: AdminDashboard },
      { path: 'csr',            name: 'CSRDashboard',     component: CSRDashboard },
      { path: 'sales',          name: 'SalesDashboard',   component: SalesDashboard },
      { path: 'rewards',        name: 'RewardRedemption', component: RewardRedemption },
      { path: 'reports',        name: 'ReportsView',      component: ReportsView },
      { path: 'settings',       name: 'SettingsView',     component: SettingsView },
      { path: 'users/add',      name: 'AddUser',          component: AddUserView },
      { path: 'users/manage',   name: 'ManageUsers',      component: ManageUsersView },
      { path: 'users/edit/:id', name: 'EditUser',         component: EditUserView, props: true }
    ]
  },
  {
    // anything else → login
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});


router.beforeEach((to, from, next) => {
  const { isLoggedIn } = useAuth(); // ✅ safe because isLoggedIn is a computed ref

  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return next({ name: 'Login' });
  }
  if (to.name === 'Login' && isLoggedIn.value) {
    return next({ name: 'AdminDashboard' });
  }
  next();
});

export default router;
