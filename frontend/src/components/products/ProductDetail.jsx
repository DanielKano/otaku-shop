import Button from '../ui/Button'
import NeonCard from '../ui/NeonCard'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'
import { useState, useEffect } from 'react'
import services from '../../services'

const ProductDetail = ({ product, onBack }) => {
  const [quantity, setQuantity] = useState(1)
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

    // ✅ Validar contra stock disponible
    if (quantity > product.stock) {
      addNotification({
        message: `Solo hay ${product.stock} unidades disponibles`,
        type: 'error',
      })
      return
    }

    addItem(product, quantity)
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
                src={product.imageUrl}
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

          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Categoría: <span className="font-semibold">{product.category}</span>
          </p>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={
                      i < Math.round(product.rating)
                        ? 'text-yellow-500'
                        : 'text-gray-300'
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {product.rating} ({product.reviews || 0} reseñas)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mb-6">
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              ${product.price?.toFixed(2) || '0.00'}
            </p>
            {product.originalPrice && (
              <p className="text-gray-400 line-through">
                ${product.originalPrice?.toFixed(2)}
              </p>
            )}
          </div>

          {/* Stock */}
          <div className="mb-6">
            {isOutOfStock ? (
              <p className="text-red-600 dark:text-red-400 font-semibold">
                Producto agotado
              </p>
            ) : (
              <p className="text-green-600 dark:text-green-400">
                En stock: {product.stock} unidades
              </p>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Cantidad:
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 glass-effect rounded-lg hover:scale-105 transition-transform font-bold text-lg"
                >
                  −
                </button>
                <span className="text-2xl font-semibold min-w-12 text-center text-gray-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock || 99, quantity + 1))
                  }
                  className="px-4 py-2 glass-effect rounded-lg hover:scale-105 transition-transform font-bold text-lg"
                >
                  +
                </button>
              </div>
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

      {/* Reviews Section */}
      {product.reviews && product.reviews > 0 && (
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Reseñas ({product.reviews})
          </h2>
          <div className="space-y-4">
            {[...Array(Math.min(3, product.reviews))].map((_, i) => (
              <div
                key={i}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Usuario {i + 1}
                  </span>
                  <span className="text-yellow-500">{'★'.repeat(4)}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Excelente producto, muy recomendado...
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </NeonCard>
  )
}

export default ProductDetail
