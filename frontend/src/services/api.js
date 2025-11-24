import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import logger from '../utils/logger'

// URL desde variables de entorno con fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

logger.info('✓ API_BASE_URL:', API_BASE_URL)

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token')
    console.log('🔍 INTERCEPTOR - Request:', config.method.toUpperCase(), config.url)
    console.log('🔍 INTERCEPTOR - Token:', token ? `${token.substring(0, 30)}...` : 'NO TOKEN')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔍 INTERCEPTOR - Authorization header SET')
    } else {
      console.warn('⚠️ No token found in localStorage')
    }
  } catch (error) {
    console.error('❌ Error accessing localStorage:', error.message)
    console.warn('⚠️ This might be due to browser tracking prevention settings')
  }
  return config
})

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo desloguear si el token está expirado o inválido (no en otros errores 401)
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || ''
      const isTokenError = errorMessage.toLowerCase().includes('token') || 
                          errorMessage.toLowerCase().includes('expired') ||
                          errorMessage.toLowerCase().includes('invalid')
      
      if (isTokenError || !localStorage.getItem('token')) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // No redirigir automáticamente, dejar que el componente lo maneje
      }
    }
    return Promise.reject(error)
  },
)

export default api
