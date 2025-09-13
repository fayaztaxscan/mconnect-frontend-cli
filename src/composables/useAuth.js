// src/composables/useAuth.js
import { ref, computed } from 'vue';
import { login as apiLogin, me as apiMe, logout as apiLogout } from '@/services/auth';

const currentUser = ref(null);
const isLoggedIn  = computed(() => !!localStorage.getItem('token'));

async function hydrate() {
  if (!localStorage.getItem('token')) {
    currentUser.value = null;
    return;
  }
  try {
    currentUser.value = await apiMe();
  } catch (e) {
    // token invalid/expired
    localStorage.removeItem('token');
    currentUser.value = null;
  }
}

async function login(email, password) {
  const { user } = await apiLogin(email, password);
  currentUser.value = user;
  return user;
}

function logout() {
  apiLogout();
  currentUser.value = null;
}

export function useAuth() {
  return { currentUser, isLoggedIn, hydrate, login, logout };
}
