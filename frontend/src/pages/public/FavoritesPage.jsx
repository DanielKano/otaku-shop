import { useState, useEffect } from 'react'
import FavoritesList from '../../components/common/FavoritesList'
import { useCart } from '../../hooks/useCart'
import { useNotification } from '../../hooks/useNotification'
import { useAuth } from '../../hooks/useAuth'
import services from '../../services'

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()
  const { addNotification } = useNotification()
  const { isAuthenticated } = useAuth()

  // Cargar favoritos del backend
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated) {
        setLoading(false)
        return
      }

      try {
        const data = await services.favoriteService.getFavorites()
        setFavorites(data)
      } catch (error) {
        console.error('Error loading favorites:', error)
        addNotification({
          message: 'Error al cargar favoritos',
          type: 'error',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [isAuthenticated, addNotification])

  const handleRemove = async (productId) => {
    try {
      await services.favoriteService.removeFavorite(productId)
      setFavorites(favorites.filter((p) => p.id !== productId))
      addNotification({
        message: 'Producto removido de favoritos',
        type: 'info',
      })
    } catch (error) {
      addNotification({
        message: 'Error al remover de favoritos',
        type: 'error',
      })
    }
  }

  const handleAddToCart = (product) => {
    addItem(product, 1)
    addNotification({
      message: `${product.name} agregado al carrito`,
      type: 'success',
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Debes iniciar sesión para ver tus favoritos
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Cargando favoritos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            ❤️ Mis Favoritos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tienes {favorites.length} producto{favorites.length !== 1 ? 's' : ''} guardado{favorites.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Favorites Grid */}
        <FavoritesList
          favorites={favorites}
          onRemove={handleRemove}
          onAddToCart={handleAddToCart}
        />
      </div>
    </div>
  )
}

export default FavoritesPage
