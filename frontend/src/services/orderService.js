import api from './api'

const orderService = {
  // GET todas las órdenes del usuario autenticado
  async getAll() {
    try {
      const response = await api.get('/orders')
      return response.data
    } catch (error) {
      console.error('Error fetching orders:', error)
      throw error
    }
  },

  // GET orden específica por ID
  async getById(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}`)
      return response.data.order
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error)
      throw error
    }
  },

  // POST crear nueva orden
  async create(orderData) {
    try {
      const response = await api.post('/orders', orderData)
      return response.data.order
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  },

  // PUT cancelar orden (solo PENDING)
  async cancel(orderId) {
    try {
      const response = await api.put(`/orders/${orderId}/cancel`)
      return response.data.order
    } catch (error) {
      console.error(`Error cancelling order ${orderId}:`, error)
      throw error
    }
  },

  // PUT actualizar estado de orden (ADMIN/SUPERADMIN)
  async updateStatus(orderId, status) {
    try {
      const response = await api.put(`/orders/${orderId}/status?status=${status}`)
      return response.data.order
    } catch (error) {
      console.error(`Error updating order ${orderId} status:`, error)
      throw error
    }
  }
}

export default orderService
