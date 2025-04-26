import { ref, computed } from 'vue';

const token = ref(localStorage.getItem('token') || '');

function parsePayload(t) {
  try {
    return JSON.parse(atob(t.split('.')[1]));
  } catch {
    return {};
  }
}

export function useAuth() {
  const login = newToken => {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  };
  const logout = () => {
    token.value = '';
    localStorage.removeItem('token');
  };

  const isLoggedIn = computed(() => Boolean(token.value));
  const userRole   = computed(() => {
    if (!token.value) return null;
    return parsePayload(token.value).role || null;
  });
  const isAdmin    = computed(() => {
    const r = userRole.value?.toLowerCase().replace(/\s+/g, '');
    return r === 'admin' || r === 'superadmin';
  });

  return { token, isLoggedIn, userRole, isAdmin, login, logout };
}
