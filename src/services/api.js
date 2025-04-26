import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000/api'
});

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default {
  // raw axios instance
  instance,

  // Auth
  login: credentials => instance.post('/auth/login', credentials),

  // Dashboard
  fetchDashboard: ()  => instance.get('/dashboard'),
  fetchManageData: () => instance.get('/manage'),

  // Lookups
  fetchRoles:   () => instance.get('/roles'),
  fetchRegions: () => instance.get('/regions'),

  // Users
  fetchUsers:   () => instance.get('/users'),
  createUser:   data => instance.post('/users', data),
  updateUser:   (id, data) => instance.put(`/users/${id}`, data),
  deleteUser:   id => instance.delete(`/users/${id}`),

  // you can add similar methods for products, categories, sales, etc.
};


  // (You can add similar methods for products, categories, sales, etc.)
  // fetchProducts:     () => instance.get('/products'),
  // createProduct:     data => instance.post('/products', data),
  // updateProduct:     (id,data) => instance.put(`/products/${id}`, data),
  // deleteProduct:     id => instance.delete(`/products/${id}`),
  // …and so on for categories, sales, rewards, reports, approvals, localization

