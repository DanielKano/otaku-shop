import api from './api'

const favoriteService = {
  /**
   * Obtiene todos los favoritos del usuario
   */
  async getFavorites() {
    const response = await api.get('/favorites')
    return response.data
  },

  /**
   * Agrega un producto a favoritos
   */
  async addFavorite(productId) {
    const response = await api.post(`/favorites/${productId}`)
    return response.data
  },

  /**
   * Elimina un producto de favoritos
   */
  async removeFavorite(productId) {
    const response = await api.delete(`/favorites/${productId}`)
    return response.data
  },

  /**
   * Verifica si un producto está en favoritos
   */
  async isFavorite(productId) {
    const response = await api.get(`/favorites/check/${productId}`)
    return response.data.isFavorite
  },

  /**
   * Cuenta los favoritos del usuario
   */
  async countFavorites() {
    const response = await api.get('/favorites/count')
    return response.data.count
  },
}

export default favoriteService
