import Button from '../ui/Button'

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const maxStock = item.stock || 0
  const isAtMaxStock = item.quantity >= maxStock
  const exceedsStock = item.quantity > maxStock

  return (
    <div className="flex gap-4 py-4 border-b border-gray-200 dark:border-gray-700">
      {/* Image */}
      <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl overflow-hidden">
        <img
          src={item.image || '🎀'}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {item.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {item.category}
        </p>
        <p className="text-blue-600 dark:text-blue-400 font-bold mt-1">
          ${item.price?.toFixed(2) || '0.00'}
        </p>
        
        {/* Stock indicators */}
        <div className="mt-1 space-y-1">
          {exceedsStock && (
            <p className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
              <span>❌</span>
              <span>Excede stock disponible (máx: {maxStock})</span>
            </p>
          )}
          {isAtMaxStock && !exceedsStock && (
            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1">
              <span>⚠️</span>
              <span>Stock máximo alcanzado ({maxStock} unidades)</span>
            </p>
          )}
          {!isAtMaxStock && maxStock > 0 && maxStock <= 5 && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
              <span>🔔</span>
              <span>Quedan {maxStock - item.quantity} unidades disponibles</span>
            </p>
          )}
        </div>
      </div>

      {/* Quantity Control */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onQuantityChange?.(item.id, item.quantity - 1)}
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
          onClick={() => onQuantityChange?.(item.id, item.quantity + 1)}
          className={`px-2 py-1 rounded transition-all ${
            isAtMaxStock
              ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-50'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600'
          }`}
          disabled={isAtMaxStock}
          title={isAtMaxStock ? `Stock máximo alcanzado: ${maxStock}` : 'Aumentar cantidad'}
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-right min-w-24">
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          ${(item.price * item.quantity).toFixed(2)}
        </p>
        <p className="text-xs text-gray-500">
          ({item.quantity} × ${item.price?.toFixed(2)})
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove?.(item.id)}
        className="text-red-500 hover:text-red-700 font-bold text-xl flex-shrink-0"
      >
        ✕
      </button>
    </div>
  )
}

export default CartItem
