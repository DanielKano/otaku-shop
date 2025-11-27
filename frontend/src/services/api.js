import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import logger from '../utils/logger'

// URL desde variables de entorno con fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:8080/api' : 'https://otaku-shop.onrender.com/api');

logger.info('✓ API_BASE_URL:', API_BASE_URL)

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token')
    console.log('🔍 INTERCEPTOR - Request:', config.method.toUpperCase(), config.url)
    console.log('🔍 INTERCEPTOR - Data:', config.data)
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

// Interceptor para manejar respuestas y renovar tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    console.error('❌ API Error:', error.response?.status, error.response?.data);
    
    // Si es 401 y no es la petición de refresh
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
      if (isRefreshing) {
        // Si ya se está renovando, añadir a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        // No hay refresh token, cerrar sesión
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Intentar renovar el token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        api.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
        originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
        
        processQueue(null, accessToken);
        
        return api(originalRequest);
      } catch (refreshError) {
        // Error al renovar, cerrar sesión
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error)
  },
)

// URL base para producción (Render) y desarrollo
// const API_BASE_URL = process.env.NODE_ENV === 'production'
//   ? 'https://<tu-dominio-en-render>.onrender.com' // Reemplaza con tu dominio en Render
//   : 'http://localhost:8080';

// Función para construir URLs de imágenes
export const getImageUrl = (imageName) => `https://otaku-shop-1.onrender.com/uploads/images/${imageName}`;

export default api
