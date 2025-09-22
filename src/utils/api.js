import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  timeout: 30000, // 30 second timeout
  withCredentials: false
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)

    // Handle network errors (including ad-blocker issues)
    if (error.code === 'ERR_BLOCKED_BY_CLIENT' || error.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
      console.warn('Request blocked by client (ad-blocker). Please disable ad-blocker for this site.')
      return Promise.reject(new Error('Request blocked by ad-blocker. Please disable ad-blocker and try again.'))
    }

    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout. Please check your connection and try again.'))
    }

    // Handle network connection issues
    if (error.code === 'ERR_NETWORK' || !error.response) {
      return Promise.reject(new Error('Network error. Please check your connection and try again.'))
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      window.location.href = '/login'
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      return Promise.reject(new Error('Server error. Please try again later.'))
    }

    return Promise.reject(error)
  }
)

export default api