import { useState } from 'react'
import Button from '../ui/Button'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'
import { formatPrice } from '../../utils/formatters'
import Modal from '../ui/Modal'

const ProductCard = ({ product, onViewDetails, onAddToCart }) => {
  const { cart, addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const { addNotification } = useNotification()
  const [showLimitModal, setShowLimitModal] = useState(false)

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      addNotification({
        message: 'Debes iniciar sesión para agregar productos al carrito',
        type: 'warning',
      })
      return
    }

    if (!cart) return

    const totalQuantityInCart = cart.reduce((total, item) => {
      if (item.id === product.id) {
        return total + item.quantity
      }
      return total
    }, 0)

    if (totalQuantityInCart + 1 > 10) {
      setShowLimitModal(true)
      return
    }

    if (!product.imageUrl) {
      addNotification({
        message: 'Este producto no tiene una imagen válida',
        type: 'error',
      })
      return
    }

    addItem(product, 1)
    addNotification({
      message: `${product.name} agregado al carrito`,
      type: 'success',
    })

    if (onAddToCart) {
      onAddToCart(product.id, 1)
    }
  }

  const isOutOfStock = !product.stock || product.stock === 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover-lift transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-neon-purple/50 dark:hover:border-neon-purple/50 animate-fade-in">
      {/* Product Image */}
      <div className="aspect-square bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden relative group">
        {product.imageUrl ? (
          <img
            src={
              product.imageUrl && product.imageUrl.startsWith('http')
                ? product.imageUrl
                : product.imageUrl
                ? `${import.meta.env.MODE === 'development'
                    ? 'http://localhost:8080'
                    : 'https://otaku-shop.onrender.com'}${product.imageUrl}`
                : 'https://via.placeholder.com/300?text=No+Image' // Placeholder if no image
            }
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-6xl">🎀</span>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Agotado</span>
          </div>
        )}
        {product.stock && product.stock < 5 && !isOutOfStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
            Últimas {product.stock}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
          {product.name}
        </h3>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {product.category}
        </p>

        <div className="flex items-baseline justify-between mb-4">
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Rating */}
        {product.rating && product.rating > 0 && (
          <div className="flex items-center gap-1 mb-4">
            <span className="text-yellow-500">★</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {product.rating.toFixed(1)} ({product.reviews || 0})
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetails?.(product.id)}
          >
            Ver detalles
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            {isOutOfStock ? 'Agotado' : 'Agregar'}
          </Button>
        </div>
      </div>
      {showLimitModal && (
        <Modal onClose={() => setShowLimitModal(false)}>
          <p>No puedes agregar más de 10 unidades de este producto al carrito.</p>
          <button onClick={() => setShowLimitModal(false)}>Cerrar</button>
        </Modal>
      )}
    </div>
  )
}

export default ProductCard
