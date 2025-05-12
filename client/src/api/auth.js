import axios from 'axios'
import { API_URL, STORAGE_KEYS } from '../config/constants'
import { useUserStore } from '../store/UserStore'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Logout if token is invalid
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      useUserStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

export const register = async (name, email, password) => {
  try {
    const response = await api.post('/auth/register', {
      name,
      email,
      password
    })
    
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' }
  }
}

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password
    })
    
    const { user, token } = response.data
    
    // Store in Zustand store and localStorage
    useUserStore.getState().setUser(user)
    useUserStore.getState().setToken(token)
    
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' }
  }
}

export const logout = () => {
  useUserStore.getState().logout()
}

export const getProfile = async () => {
  try {
    const response = await api.get('/users/me')
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get profile' }
  }
}

export default api