// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

// Auth & Layout
import LoginView      from '@/views/auth/LoginView.vue';
import ProtectedRoute from '@/components/layout/ProtectedRoute.vue';

// Dashboards
import AdminDashboard from '@/views/dashboard/AdminDashboard.vue';
import CSRDashboard   from '@/views/dashboard/CSRDashboard.vue';
import SalesDashboard from '@/views/dashboard/SalesDashboard.vue';
import ReportsView    from '@/views/dashboard/ReportsView.vue';

// User Management
import ManageUsersView from '@/views/users/ManageUsersView.vue';
import AddUserView     from '@/views/users/AddUserView.vue';
import EditUserView    from '@/views/users/EditUserView.vue';
import UserDetails     from '@/views/users/UserDetails.vue';

// Sales & Forms
import SalesForm      from '@/components/forms/SalesForm.vue';
import UploadWizard   from '@/components/forms/UploadWizard.vue';

// Rewards — Categories
import RewardCategoriesList  from '@/views/rewards/RewardCategoriesList.vue';
import CreateRewardCategory  from '@/views/rewards/CreateRewardCategory.vue';
import RewardCategoryDetails from '@/views/rewards/RewardCategoryDetails.vue';
import EditRewardCategory    from '@/views/rewards/EditRewardCategory.vue';

// Rewards — Items
import RewardItemsList    from '@/views/rewards/RewardItemsList.vue';
import CreateRewardItem   from '@/views/rewards/CreateRewardItem.vue';
import ViewRewardItem     from '@/views/rewards/ViewRewardItem.vue';
import EditRewardItem     from '@/views/rewards/EditRewardItem.vue';

// Dealer Management (under Settings)
import DealersList   from '@/views/settings/Dealers/DealersList.vue';
import DealerForm    from '@/views/settings/Dealers/DealersForm.vue';
import DealerDetails from '@/views/settings/Dealers/DealerDetails.vue';

// Shop Management (under Settings)
const ShopsList   = () => import('@/views/settings/Shops/ShopList.vue');
const ShopForm    = () => import('@/views/settings/Shops/ShopForm.vue');
const ShopDetails = () => import('@/views/settings/Shops/ShopDetails.vue');

// Settings & Audit
import SettingsView from '@/views/settings/SettingsView.vue';
import AuditViewer  from '@/views/settings/AuditViewer.vue';

const { isLoggedIn } = useAuth();

const routes = [
  // Public
  { path: '/',     redirect: '/login' },
  { path: '/login', name: 'Login', component: LoginView },

  // Protected (requiresAuth)
  {
    path: '/',
    component: ProtectedRoute,
    meta: { requiresAuth: true },
    children: [
      // Landing
      { path: '', redirect: { name: 'AdminDashboard' } },

      // Dashboards
      { path: 'admin',   name: 'AdminDashboard', component: AdminDashboard },
      { path: 'csr',     name: 'CSRDashboard',   component: CSRDashboard },
      {
        path: 'sales',
        children: [
          { path: '',       name: 'SalesDashboard', component: SalesDashboard },
          { path: 'entry',  name: 'SalesEntry',      component: SalesForm     },
          { path: 'upload', name: 'BulkUpload',      component: UploadWizard }
        ]
      },
      { path: 'reports', name: 'ReportsView', component: ReportsView },

      // Users
      {
        path: 'users',
        children: [
          { path: 'manage',   name: 'ManageUsers', component: ManageUsersView },
          { path: 'add',      name: 'AddUser',     component: AddUserView     },
          { path: 'edit/:id', name: 'EditUser',    component: EditUserView, props: true },
          { path: 'view/:id', name: 'UserDetails', component: UserDetails,  props: true }
        ]
      },

      // Rewards
      {
        path: 'rewards',
        children: [
          // Categories
          {
            path: 'categories',
            children: [
              { path: '',        name: 'ManageRewardCategories', component: RewardCategoriesList  },
              { path: 'add',     name: 'AddRewardCategory',      component: CreateRewardCategory  },
              { path: ':id',     name: 'ViewRewardCategory',     component: RewardCategoryDetails, props: true },
              { path: ':id/edit',name: 'EditRewardCategory',     component: EditRewardCategory,    props: true }
            ]
          },
          // Items
          {
            path: 'items',
            children: [
              { path: '',        name: 'ManageRewardItems',  component: RewardItemsList    },
              { path: 'add',     name: 'CreateRewardItem',   component: CreateRewardItem   },
              { path: ':id',     name: 'ViewRewardItem',     component: ViewRewardItem,    props: true },
              { path: ':id/edit',name: 'EditRewardItem',     component: EditRewardItem,    props: true }
            ]
          }
        ]
      },

      // Settings
      {
        path: 'settings',
        children: [
          { path: '',           name: 'SettingsView', component: SettingsView },
          { path: 'audit-logs', name: 'AuditLogs',    component: AuditViewer },

          // Dealers
          {
            path: 'dealers',
            children: [
              { path: '',         name: 'DealersList',   component: DealersList   },
              { path: 'add',      name: 'AddDealer',     component: DealerForm    },
              { path: ':id/edit', name: 'EditDealer',    component: DealerForm,   props: true },
              { path: ':id',      name: 'DealerDetails', component: DealerDetails,props: true }
            ]
          },

          // Shops
          {
            path: 'shops',
            children: [
              { path: '',         name: 'ShopsList',    component: ShopsList   },
              { path: 'add',      name: 'AddShop',      component: ShopForm    },
              { path: ':id/edit', name: 'EditShop',     component: ShopForm,   props: true },
              { path: ':id',      name: 'ShopDetails',  component: ShopDetails,props: true }
            ]
          }
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

// Global auth guard
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return next({ name: 'Login' });
  }
  next();
});

export default router;
