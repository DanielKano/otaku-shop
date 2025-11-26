import Button from '../ui/Button'
import NeonCard from '../ui/NeonCard'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'
import { useState, useEffect } from 'react'
import services from '../../services'

const ProductDetail = ({ product, onBack }) => {
  const [isFavorite, setIsFavorite] = useState(false)
  const [loadingFavorite, setLoadingFavorite] = useState(false)
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const { addNotification } = useNotification()

  // Cargar estado de favorito cuando cambia el producto
  useEffect(() => {
    const checkFavorite = async () => {
      // Verificar token directamente para evitar race conditions
      const token = localStorage.getItem('token')
      
      if (!token || !product) {
        setIsFavorite(false)
        return
      }
      
      try {
        const favoriteStatus = await services.favoriteService.isFavorite(product.id)
        setIsFavorite(favoriteStatus)
      } catch (error) {
        // Silenciar errores 401 (usuario no autenticado)
        if (error.response?.status === 401) {
          setIsFavorite(false)
        } else {
          console.error('Error checking favorite:', error)
        }
      }
    }
    checkFavorite()
  }, [product])

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Producto no encontrado</p>
        <Button onClick={onBack} className="mt-4">
          Volver
        </Button>
      </div>
    )
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      addNotification({
        message: 'Debes iniciar sesión para comprar',
        type: 'warning',
      })
      return
    }

    if (product.stock <= 0) {
      addNotification({
        message: 'Producto agotado',
        type: 'error',
      })
      return
    }

    addItem(product, 1) // Always add one unit
    addNotification({
      message: `${product.name} agregado al carrito`,
      type: 'success',
    })
  }

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      addNotification({
        message: 'Debes iniciar sesión para agregar favoritos',
        type: 'warning',
      })
      return
    }

    setLoadingFavorite(true)
    try {
      if (isFavorite) {
        await services.favoriteService.removeFavorite(product.id)
        setIsFavorite(false)
        addNotification({
          message: 'Producto eliminado de favoritos',
          type: 'info',
        })
      } else {
        await services.favoriteService.addFavorite(product.id)
        setIsFavorite(true)
        addNotification({
          message: 'Producto agregado a favoritos',
          type: 'success',
        })
      }
    } catch (error) {
      // Manejar error 401 específicamente
      if (error.response?.status === 401) {
        addNotification({
          message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente',
          type: 'error',
        })
      } else {
        addNotification({
          message: error.response?.data?.error || 'Error al actualizar favoritos',
          type: 'error',
        })
      }
    } finally {
      setLoadingFavorite(false)
    }
  }

  const isOutOfStock = !product.stock || product.stock === 0

  return (
    <NeonCard neonColor="gradient" className="p-6 animate-fade-in">
      <Button onClick={onBack} variant="glass" className="mb-4">
        ← Volver
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div>
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-6xl overflow-hidden">
            {product.imageUrl ? (
              <img
                src={`http://localhost:8080/api/uploads/images/${product.imageUrl}`}
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
            ) : (
              <span className="text-6xl">🎀</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {product.name}
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mb-6">
            🏷️ <span className="font-semibold capitalize">{product.category || 'Sin categoría'}</span>
          </p>

          {/* Rating and Reviews */}
          {product.rating && product.rating > 0 ? (
            <div className="flex items-center gap-3 mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={
                      i < Math.round(product.rating)
                        ? 'text-2xl text-yellow-500'
                        : 'text-2xl text-gray-300'
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
              <div className="ml-2">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {product.rating.toFixed(1)} / 5
                </p>
                {product.reviews && product.reviews > 0 && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {product.reviews} {product.reviews === 1 ? 'reseña' : 'reseñas'}
                  </p>
                )}
              </div>
            </div>
          ) : null}

          {/* Price Section */}
          <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Precio</p>
            <div className="flex items-baseline gap-3">
              <p className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                ${product.price ? parseFloat(product.price).toFixed(2) : 'Consultar'}
              </p>
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="text-lg text-gray-400 line-through">
                  ${parseFloat(product.originalPrice).toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Stock */}
          <div className="mb-8 p-4 rounded-lg border-2" style={{
            borderColor: isOutOfStock ? '#ef4444' : '#22c55e',
            backgroundColor: isOutOfStock ? 'rgba(239, 68, 68, 0.05)' : 'rgba(34, 197, 94, 0.05)'
          }}>
            {isOutOfStock ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl">❌</span>
                <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                  Producto agotado
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {product.stock} {product.stock === 1 ? 'unidad disponible' : 'unidades disponibles'}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                Descripción
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                {product.description}
              </p>
            </div>
          )}

          {/* Add to Cart */}
          <div className="flex gap-4">
            <Button
              variant="gradient"
              size="lg"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className="flex-1"
            >
              {isOutOfStock ? '❌ Agotado' : '🛒 Agregar al carrito'}
            </Button>
            <Button 
              variant={isFavorite ? "gradient" : "gradient-outline"} 
              size="lg" 
              className="flex-1"
              onClick={handleToggleFavorite}
              disabled={loadingFavorite}
            >
              {isFavorite ? '❤️ En Favoritos' : '♥ Favorito'}
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews Section - Solo si hay reseñas reales */}
      {product.reviews && product.reviews > 0 && (
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              📝 Reseñas
            </h2>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold">
              {product.reviews}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Las reseñas de clientes se mostrarán aquí próximamente.
          </p>
        </div>
      )}
    </NeonCard>
  )
}

export default ProductDetail
