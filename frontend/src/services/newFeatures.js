import api from './api';

export const passwordResetService = {
  // Solicitar recuperación de contraseña
  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Validar token de recuperación
  async validateResetToken(token) {
    const response = await api.get('/auth/validate-reset-token', {
      params: { token }
    });
    return response.data;
  },

  // Restablecer contraseña
  async resetPassword(token, newPassword) {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword
    });
    return response.data;
  }
};

export const refreshTokenService = {
  // Renovar access token
  async refreshToken(refreshToken) {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // Cerrar sesión
  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};

export const reviewService = {
  // Crear reseña
  async createReview(reviewData) {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  // Actualizar reseña
  async updateReview(reviewId, reviewData) {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Eliminar reseña
  async deleteReview(reviewId) {
    await api.delete(`/reviews/${reviewId}`);
  },

  // Obtener reseñas de un producto
  async getProductReviews(productId, page = 0, size = 10) {
    const response = await api.get(`/reviews/product/${productId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Obtener mis reseñas
  async getMyReviews(page = 0, size = 10) {
    const response = await api.get('/reviews/user/my-reviews', {
      params: { page, size }
    });
    return response.data;
  },

  // Obtener estadísticas de calificaciones
  async getProductRatingStats(productId) {
    const response = await api.get(`/reviews/product/${productId}/stats`);
    return response.data;
  },

  // Agregar respuesta del vendedor
  async addVendorResponse(reviewId, response) {
    const res = await api.post(`/reviews/${reviewId}/vendor-response`, { response });
    return res.data;
  }
};

export const notificationService = {
  // Obtener todas las notificaciones
  async getNotifications(page = 0, size = 20) {
    const response = await api.get('/notifications', {
      params: { page, size }
    });
    return response.data;
  },

  // Obtener notificaciones no leídas
  async getUnreadNotifications() {
    const response = await api.get('/notifications/unread');
    return response.data;
  },

  // Obtener cantidad de notificaciones no leídas
  async getUnreadCount() {
    const response = await api.get('/notifications/unread/count');
    return response.data;
  },

  // Marcar como leída
  async markAsRead(notificationId) {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Marcar todas como leídas
  async markAllAsRead() {
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
  },

  // Eliminar notificación
  async deleteNotification(notificationId) {
    await api.delete(`/notifications/${notificationId}`);
  }
};
