// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

import LoginView         from '@/views/auth/LoginView.vue';
import AdminDashboard    from '@/views/dashboard/AdminDashboard.vue';
import CSRDashboard      from '@/views/dashboard/CSRDashboard.vue';
import SalesDashboard    from '@/views/dashboard/SalesDashboard.vue';
import RewardRedemption  from '@/views/dashboard/RewardRedemption.vue';
import ReportsView       from '@/views/dashboard/ReportsView.vue';
import SettingsView      from '@/views/settings/SettingsView.vue';

import AddUserView       from '@/views/users/AddUserView.vue';
import ManageUsersView   from '@/views/users/ManageUsersView.vue';
import EditUserView      from '@/views/users/EditUserView.vue';

import ProtectedRoute    from '@/components/layout/ProtectedRoute.vue';

import UploadWizard      from '@/components/forms/UploadWizard.vue';
import SalesForm         from '@/components/forms/SalesForm.vue';
import RewardDashboard   from '@/components/ui/RewardDashboard.vue';
import AuditViewer       from '@/components/ui/AuditViewer.vue';

const { isLoggedIn } = useAuth();

const routes = [
  // Public
  { path: '/',               redirect: '/login' },
  { path: '/login',          name: 'Login',           component: LoginView },

  // Protected
  {
    path: '/',
    component: ProtectedRoute,
    meta: { requiresAuth: true },
    children: [
      // Default redirect
      { path: '',               redirect: { name: 'AdminDashboard' } },

      // Dashboards
      { path: 'admin',          name: 'AdminDashboard',   component: AdminDashboard },
      { path: 'csr',            name: 'CSRDashboard',     component: CSRDashboard },

      // Users
      {
        path: 'users',
        children: [
          { path: 'add',      name: 'AddUser',        component: AddUserView },
          { path: 'manage',   name: 'ManageUsers',    component: ManageUsersView },
          { path: 'edit/:id', name: 'EditUser',       component: EditUserView, props: true }
        ]
      },

      // Catalog (Sales products & categories)
      {
        path: 'catalog',
        children: [
          { path: 'products',           name: 'ProductList',    component: () => import('@/views/catalog/ProductListView.vue') },
          { path: 'products/new',       name: 'CreateProduct',  component: () => import('@/views/catalog/ProductFormView.vue') },
          { path: 'products/:id/edit',  name: 'EditProduct',    component: () => import('@/views/catalog/ProductFormView.vue'), props: true },
          { path: 'categories',         name: 'CategoryList',   component: () => import('@/views/catalog/CategoryListView.vue') },
          { path: 'categories/new',     name: 'CreateCategory', component: () => import('@/views/catalog/CategoryFormView.vue') },
          { path: 'categories/:id/edit',name: 'EditCategory',   component: () => import('@/views/catalog/CategoryFormView.vue'), props: true }
        ]
      },

      // Sales
      {
        path: 'sales',
        children: [
          { path: '',       name: 'SalesDashboard', component: SalesDashboard },
          { path: 'entry',  name: 'SalesEntry',      component: SalesForm },
          { path: 'upload', name: 'BulkUpload',      component: UploadWizard }
        ]
      },
      // src/router/index.js, inside the `/rewards` children:
      {
        path: 'categories',
        children: [
          {
            path: '',
            name: 'ManageRewardCategories',
            component: () => import('@/views/rewards/RewardCategoriesList.vue')
          },
          {
            path: 'new',
            name: 'CreateRewardCategory',
            component: () => import('@/views/rewards/CreateRewardCategory.vue')
          },
          {
            path: ':id/edit',
            name: 'EditRewardCategory',
            component: () => import('@/views/rewards/CreateRewardCategory.vue'),
            props: true
          }
        ]
      },

      // Rewards
      {
        path: 'rewards',
        children: [
          { path: '',              name: 'RewardRedemption',   component: RewardRedemption },
          { path: 'dashboard',     name: 'RewardDashboard',    component: RewardDashboard },
          {
            path: 'items',
            children: [
              { path: '',        name: 'ManageRewardItems',    component: () => import('@/views/rewards/RewardItemsList.vue') },
              { path: 'new',     name: 'CreateRewardItem',     component: () => import('@/views/rewards/CreateRewardItem.vue') },
              { path: ':id/edit',name: 'EditRewardItem',       component: () => import('@/views/rewards/CreateRewardItem.vue'), props: true }
            ]
          }

        ]
      },

      // Reports
      { path: 'reports', name: 'ReportsView', component: ReportsView },

      // Settings
      {
        path: 'settings',
        children: [
          { path: '',             name: 'SettingsView', component: SettingsView },
          { path: 'audit-logs',   name: 'AuditLogs',    component: AuditViewer }
        ]
      }
    ]
  },

  // Fallback
  { path: '/:pathMatch(.*)*', redirect: '/login' }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return next({ name: 'Login' });
  }
  next();
});

export default router;
