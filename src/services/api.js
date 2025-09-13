import axios from 'axios'

const instance = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000/api',
  withCredentials: true
})

// Attach token
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 responses globally
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.warn('Auth failed → clearing token and redirecting to login')
      localStorage.removeItem('token')

      // If you’re using Vue Router:
      window.location.href = '/login'  // or: router.push({ name: 'Login' })
    }
    return Promise.reject(error)
  }
)

export default instance
