import { useState } from 'react'
import Button from '../ui/Button'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'
import { formatPrice, getStockStatus } from '../../utils/formatters'

const ProductCard = ({ product, onViewDetails }) => {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const { addNotification } = useNotification()

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      addNotification({
        message: 'Debes iniciar sesión para agregar productos al carrito',
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
    setQuantity(1)
  }

  const isOutOfStock = !product.stock || product.stock === 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover-lift transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-neon-purple/50 dark:hover:border-neon-purple/50 animate-fade-in">
      {/* Product Image */}
      <div className="aspect-square bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden relative group">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
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
        {product.rating && (
          <div className="flex items-center gap-1 mb-4">
            <span className="text-yellow-500">★</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {product.rating} ({product.reviews || 0})
            </span>
          </div>
        )}

        {/* Quantity Selector */}
        {!isOutOfStock && isAuthenticated && (
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              −
            </button>
            <span className="flex-1 text-center">{quantity}</span>
            <button
              onClick={() =>
                setQuantity(Math.min(product.stock || 1, quantity + 1))
              }
              disabled={quantity >= product.stock}
              className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
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
    </div>
  )
}

export default ProductCard
