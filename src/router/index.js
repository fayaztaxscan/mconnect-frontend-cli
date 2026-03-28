// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

// Auth & Layout
import LoginView from '@/views/auth/LoginView.vue'
import ProtectedRoute from '@/components/layout/ProtectedRoute.vue'

// Dashboards
import AdminDashboard from '@/views/dashboard/AdminDashboard.vue'
import CSRDashboard from '@/views/dashboard/CSRDashboard.vue'
import SalesDashboard from '@/views/dashboard/SalesDashboard.vue'
import ReportsView from '@/views/dashboard/ReportsView.vue'

// User Management
import ManageUsersView from '@/views/users/ManageUsersView.vue'
import AddUserView from '@/views/users/AddUserView.vue'
import EditUserView from '@/views/users/EditUserView.vue'
import UserDetails from '@/views/users/UserDetails.vue'

// Sales & Forms
import SalesForm from '@/components/forms/SalesForm.vue'
import UploadWizard from '@/components/forms/UploadWizard.vue'

// Rewards — Categories
import RewardCategoriesList from '@/views/rewards/RewardCategoriesList.vue'
import CreateRewardCategory from '@/views/rewards/CreateRewardCategory.vue'
import RewardCategoryDetails from '@/views/rewards/RewardCategoryDetails.vue'
import EditRewardCategory from '@/views/rewards/EditRewardCategory.vue'

// Rewards — Items
import RewardItemsList from '@/views/rewards/RewardItemsList.vue'
import CreateRewardItem from '@/views/rewards/CreateRewardItem.vue'
import ViewRewardItem from '@/views/rewards/ViewRewardItem.vue'
import EditRewardItem from '@/views/rewards/EditRewardItem.vue'

// Fulfillment Panel
import FulfillClaims from '@/views/rewards/FulfillClaims.vue'

// Dealer Management (under Settings)
import DealersList from '@/views/settings/Dealers/DealersList.vue'
import DealersForm from '@/views/settings/Dealers/DealersForm.vue'
import DealerDetails from '@/views/settings/Dealers/DealerDetails.vue'

// Catalog — Brands (lazy)
const BrandsList = () => import('@/views/catalog/BrandsList.vue')
const BrandForm = () => import('@/views/catalog/BrandForm.vue')

// ✅ Shops (lazy)
const ShopsList = () => import('@/views/settings/Shops/ShopList.vue')
const ShopForm = () => import('@/views/settings/Shops/ShopForm.vue')
const ShopDetails = () => import('@/views/settings/Shops/ShopDetails.vue')

// Catalog — Divisions (lazy)
const DivisionsList = () => import('@/views/catalog/divisions/DivisionsList.vue')
const DivisionForm = () => import('@/views/catalog/divisions/DivisionForm.vue')

// Catalog — Categories (lazy)
const CategoriesList = () => import('@/views/catalog/categories/CategoriesPage.vue')
const CategoryForm = () => import('@/views/catalog/categories/CategoryForm.vue')

// Catalog — Products (lazy)
const ProductListView = () => import('@/views/products/ProductListView.vue')
const ProductFormView = () => import('@/views/products/ProductFormView.vue')
const ProductDetails = () => import('@/views/products/ProductDetails.vue')

// ✅ CSR Signup Requests page
const CSRSignupRequests = () => import('@/views/csr/SignupRequestsView.vue')

// BDM approval queue
const BDMRequests = () => import('@/views/bdm/BDMRequestsView.vue')

const routes = [
  // Public
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: LoginView },

  // Protected (App Shell)
  {
    path: '/',
    component: ProtectedRoute,
    meta: { requiresAuth: true },
    children: [
      // Default landing (guard will re-route by role)
      { path: '', redirect: { name: 'AdminDashboard' } },

      // ─────────────────────────────────────────────
      // ADMIN
      // ─────────────────────────────────────────────
      {
        path: 'admin',
        children: [
          { path: '', name: 'AdminDashboard', component: AdminDashboard },
          {
            path: 'notifications',
            name: 'NotificationsView',
            component: () => import('@/views/admin/NotificationsView.vue')
          }
        ]
      },

      // ─────────────────────────────────────────────
      // CSR
      // ─────────────────────────────────────────────
      {
        path: 'csr',
        children: [
          { path: '', name: 'CSRDashboard', component: CSRDashboard },
          { path: 'signup-requests', name: 'CSRSignupRequests', component: CSRSignupRequests }
        ]
      },

      // ─────────────────────────────────────────────
      // BDM ✅
      // ─────────────────────────────────────────────
      {
        path: 'bdm',
        children: [
          { path: 'requests', name: 'BDMRequests', component: BDMRequests }
        ]
      },

      // ─────────────────────────────────────────────
      // SALES
      // ─────────────────────────────────────────────
      {
        path: 'sales',
        children: [
          { path: '', name: 'SalesDashboard', component: SalesDashboard },
          { path: 'entry', name: 'SalesEntry', component: SalesForm },
          { path: 'upload', name: 'BulkUpload', component: UploadWizard }
        ]
      },

      { path: 'reports', name: 'ReportsView', component: ReportsView },

      // ─────────────────────────────────────────────
      // CATALOG: BRANDS
      // ─────────────────────────────────────────────
      {
        path: 'brands',
        children: [
          { path: '', name: 'BrandsList', component: BrandsList },
          { path: 'new', name: 'BrandCreate', component: BrandForm },
          { path: ':id', name: 'BrandEdit', component: BrandForm, props: true }
        ]
      },

      // ─────────────────────────────────────────────
      // CATALOG: DIVISIONS
      // ─────────────────────────────────────────────
      {
        path: 'divisions',
        children: [
          { path: '', name: 'DivisionsList', component: DivisionsList },
          { path: 'new', name: 'DivisionCreate', component: DivisionForm },
          { path: ':id', name: 'DivisionEdit', component: DivisionForm, props: true }
        ]
      },

      // ─────────────────────────────────────────────
      // CATALOG: CATEGORIES
      // ─────────────────────────────────────────────
      {
        path: 'categories',
        children: [
          { path: '', name: 'CategoriesList', component: CategoriesList },
          { path: 'new', name: 'CategoryCreate', component: CategoryForm },
          { path: ':id', name: 'CategoryEdit', component: CategoryForm, props: true }
        ]
      },

      // ─────────────────────────────────────────────
      // CATALOG: PRODUCTS
      // ─────────────────────────────────────────────
      {
        path: 'products',
        children: [
          { path: '', name: 'ProductList', component: ProductListView },
          { path: 'new', name: 'CreateProduct', component: ProductFormView },
          { path: ':id/edit', name: 'EditProduct', component: ProductFormView, props: true },
          { path: ':id', name: 'ProductDetails', component: ProductDetails, props: true }
        ]
      },

      // ─────────────────────────────────────────────
      // DEALERS
      // ─────────────────────────────────────────────
      {
        path: 'dealers',
        children: [
          { path: '', name: 'DealersList', component: DealersList },
          { path: 'add', name: 'AddDealer', component: DealersForm },
          { path: ':id/edit', name: 'EditDealer', component: DealersForm, props: true },
          { path: ':id', name: 'DealerDetails', component: DealerDetails, props: true }
        ]
      },

      // ─────────────────────────────────────────────
      // USERS
      // ─────────────────────────────────────────────
      {
        path: 'users',
        children: [
          { path: 'manage', name: 'ManageUsers', component: ManageUsersView },
          { path: 'add', name: 'AddUser', component: AddUserView },
          { path: 'edit/:id', name: 'EditUser', component: EditUserView, props: true },
          { path: 'view/:id', name: 'UserDetails', component: UserDetails, props: true }
        ]
      },

      // ─────────────────────────────────────────────
      // REWARDS
      // ─────────────────────────────────────────────
      {
        path: 'rewards',
        children: [
          { path: 'fulfillments', name: 'FulfillClaims', component: FulfillClaims },

          {
            path: 'categories',
            children: [
              { path: '', name: 'ManageRewardCategories', component: RewardCategoriesList },
              { path: 'add', name: 'AddRewardCategory', component: CreateRewardCategory },
              { path: ':id', name: 'ViewRewardCategory', component: RewardCategoryDetails, props: true },
              { path: ':id/edit', name: 'EditRewardCategory', component: EditRewardCategory, props: true }
            ]
          },

          {
            path: 'items',
            children: [
              { path: '', name: 'ManageRewardItems', component: RewardItemsList },
              { path: 'add', name: 'CreateRewardItem', component: CreateRewardItem },
              { path: ':id', name: 'ViewRewardItem', component: ViewRewardItem, props: true },
              { path: ':id/edit', name: 'EditRewardItem', component: EditRewardItem, props: true }
            ]
          }
        ]
      },

      // ─────────────────────────────────────────────
      // SETTINGS
      // ─────────────────────────────────────────────
      {
        path: 'settings',
        children: [
          { path: '', name: 'SettingsView', component: () => import('@/views/settings/SettingsView.vue') },
          { path: 'audit-logs', name: 'AuditLogs', component: () => import('@/views/settings/AuditViewer.vue') },

          {
            path: 'shops',
            children: [
              { path: '', name: 'ShopsList', component: ShopsList },
              { path: 'add', name: 'AddShop', component: ShopForm },
              { path: ':id/edit', name: 'EditShop', component: ShopForm, props: true },
              { path: ':id', name: 'ShopDetails', component: ShopDetails, props: true }
            ]
          }
        ]
      }
    ]
  },

  // Fallback
  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL || '/'),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

// Global auth guard
router.beforeEach(async (to, _from, next) => {
  const auth = useAuth()

  // Requires auth?
  if (to.meta.requiresAuth && !auth.isLoggedIn.value) {
    return next({ name: 'Login' })
  }

  // Hydrate once
  if (auth.isLoggedIn.value && !auth.currentUser.value) {
    try {
      await auth.hydrate()
    } catch (_) {
      return next({ name: 'Login' })
    }
  }

  const roleName = String(auth.currentUser.value?.role_name || '').toUpperCase()

  // Role landing
  if (to.path === '/' || to.name === 'AdminDashboard') {
    if (roleName === 'ADMIN' || roleName === 'SUPERADMIN') return next({ name: 'AdminDashboard' })
    if (roleName === 'CSR') return next({ name: 'CSRSignupRequests' })
    if (roleName === 'BDM') return next({ name: 'BDMRequests' })
  }

  // CSR restrictions
  if (roleName === 'CSR') {
    const allowed = new Set(['CSRDashboard', 'CSRSignupRequests', 'Login'])
    if (!allowed.has(to.name)) return next({ name: 'CSRSignupRequests' })
  }

  // BDM restrictions ✅ (only approval queue for now)
  if (roleName === 'BDM') {
    const allowed = new Set(['BDMRequests', 'Login'])
    if (!allowed.has(to.name)) return next({ name: 'BDMRequests' })
  }

  next()
})

export default router
