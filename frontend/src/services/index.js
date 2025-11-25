import api from './api'
import favoriteService from './favoriteService'
import stockReservationService from './stockReservationService'

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  verifyToken: () => api.get('/auth/verify'),
  refreshToken: () => api.post('/auth/refresh'),
  resendVerificationEmail: (email) =>
    api.post('/auth/resend-verification', { email }),
  resetPassword: (email) => api.post('/auth/reset-password', { email }),
  updatePassword: (data) => api.put('/auth/password', data),
}

export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => {
    // Si es FormData (contiene archivo), no setear Content-Type
    if (data instanceof FormData) {
      return api.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }
    // Si es JSON normal
    return api.post('/products', data)
  },
  update: (id, data) => {
    // Si es FormData (contiene archivo), no setear Content-Type
    if (data instanceof FormData) {
      return api.put(`/products/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }
    // Si es JSON normal
    return api.put(`/products/${id}`, data)
  },
  delete: (id) => api.delete(`/products/${id}`),
  getPending: (params) => api.get('/products/pending', { params }),
  getApproved: (params) => api.get('/products/approved', { params }),
  approve: (id) => api.post(`/products/${id}/approve`),
  reject: (id, data) => api.post(`/products/${id}/reject`, data),
  // ✅ NUEVOS MÉTODOS
  getMyProducts: (status) => {
    const url = status ? `/products/myproducts?status=${status}` : '/products/myproducts'
    return api.get(url)
  },
  cancel: (id) => api.post(`/products/${id}/cancel`),
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(response => {
      // El backend devuelve { url, filename }
      return response.data.url || response.data
    })
  },
}

export const cartService = {
  getCart: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/add', data),
  updateItem: (id, data) => api.put(`/cart/${id}`, data),
  removeItem: (id) => api.delete(`/cart/${id}`),
  clearCart: () => api.delete('/cart'),
}

export const orderService = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status?status=${status}`),
  getInvoice: (id) => api.get(`/orders/${id}/invoice`, { responseType: 'blob' }),
}

export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  changeRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  create: (data) => api.post('/users', data),
  suspend: (id) => api.put(`/users/${id}/suspend`),
}

export const uploadService = {
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// ✨ SERVICIO DE RESERVAS DE STOCK (Fase 2)
export const stockReservationApiService = {
  reserve: (data) => api.post('/stock-reservations/reserve', data),
  update: (reservationId, quantity) => 
    api.put(`/stock-reservations/${reservationId}/update`, { quantity }),
  renew: (reservationId) => 
    api.put(`/stock-reservations/${reservationId}/renew`),
  release: (reservationId) => 
    api.delete(`/stock-reservations/${reservationId}`),
  checkAvailability: (data) => 
    api.post('/stock-reservations/available', data),
  getUserReservations: (userId) => 
    api.get(`/stock-reservations/user/${userId}`),
  getSessionReservations: (sessionId) => 
    api.get(`/stock-reservations/session/${sessionId}`),
}

export default {
  authService,
  productService,
  cartService,
  orderService,
  userService,
  uploadService,
  favoriteService,
  stockReservationService,
  stockReservationApiService,
}
