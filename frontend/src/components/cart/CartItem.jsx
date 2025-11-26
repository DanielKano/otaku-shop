import { useMemo } from 'react'
import Button from '../ui/Button'
import useCartValidations from '../../hooks/useCartValidations'

// ✅ Build full image URL for cart items
const buildImageUrl = (imageName) => {
  if (!imageName) return null
  if (imageName.startsWith('http')) return imageName // Already full URL
  // Backend returns just filename, must prepend API path
  return `http://localhost:8080/api/uploads/images/${imageName}`
}

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const { getReservationTimeRemaining, getStockInfo } = useCartValidations()
  const maxStock = item.productStock || 0
  const imageUrl = useMemo(() => buildImageUrl(item.productImage), [item.productImage])
  const timeRemaining = useMemo(() => getReservationTimeRemaining(item.id), [item.id, getReservationTimeRemaining])
  const stockInfo = useMemo(() => getStockInfo(item.id), [item.id, getStockInfo])
  
  // ✅ Available stock is the current backend productStock (already accounts for cart operations)
  const availableStock = stockInfo ? stockInfo.available : maxStock
  const isAtMaxStock = item.quantity >= availableStock || item.quantity >= 10
  const exceedsStock = item.quantity > maxStock

  return (
    <div className="flex gap-4 py-4 border-b border-gray-200 dark:border-gray-700">
      {/* Image */}
      <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.productName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.parentElement.textContent = '🎀'
            }}
          />
        ) : (
          <span>🎀</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {item.productName}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {item.category}
        </p>
        <p className="text-blue-600 dark:text-blue-400 font-bold mt-1">
          ${item.productPrice?.toFixed(2) || '0.00'}
        </p>
        
        {/* Stock indicators */}
        <div className="mt-2 space-y-1">
          {/* Información de reserva */}
          {timeRemaining && (
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
              <span>🔒</span>
              <span>Reservado por {timeRemaining.days}d {timeRemaining.hours}h</span>
            </p>
          )}
          
          {/* Stock disponible */}
          {stockInfo && (
            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <span>📦</span>
              <span>Stock disponible: {stockInfo.available}/{stockInfo.totalStock} unidades</span>
            </p>
          )}
          
          {/* Advertencias */}
          {exceedsStock && (
            <p className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
              <span>❌</span>
              <span>Excede stock disponible (máx: {maxStock})</span>
            </p>
          )}
          
          {isAtMaxStock && !exceedsStock && item.quantity >= 10 && (
            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1">
              <span>⚠️</span>
              <span>Límite de 10 unidades alcanzado</span>
            </p>
          )}
          
          {/* Advertencia de stock bajo */}
          {timeRemaining && timeRemaining.days === 0 && timeRemaining.hours < 6 && (
            <p className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
              <span>⏰</span>
              <span>¡Reserva vence en menos de 6 horas!</span>
            </p>
          )}
        </div>
      </div>

      {/* Quantity Control */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            console.debug('[CartItem] decrease click', item.id, item.quantity - 1)
            onQuantityChange?.(item.id, item.quantity - 1)
          }}
          className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
          disabled={item.quantity <= 1}
          aria-label="Disminuir cantidad"
        >
          −
        </button>
        <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
          {item.quantity}
        </span>
        <button
          onClick={() => {
            console.debug('[CartItem] increase click', item.id, item.quantity + 1)
            onQuantityChange?.(item.id, item.quantity + 1)
          }}
          className={`px-2 py-1 rounded transition-all ${
            isAtMaxStock
              ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-50'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600'
          }`}
          disabled={isAtMaxStock}
          title={item.quantity >= 10 ? 'Límite de 10 unidades' : !availableStock ? 'Sin stock disponible' : 'Aumentar cantidad'}
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-right min-w-24">
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          ${(item.productPrice * item.quantity).toFixed(2)}
        </p>
        <p className="text-xs text-gray-500">
          ({item.quantity} × ${item.productPrice?.toFixed(2)})
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => {
          console.debug('[CartItem] remove click', item.id)
          onRemove?.(item.id)
        }}
        className="text-red-500 hover:text-red-700 font-bold text-xl flex-shrink-0"
      >
        ✕
      </button>
    </div>
  )
}

export default CartItem
