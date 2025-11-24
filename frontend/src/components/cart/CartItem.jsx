import Button from '../ui/Button'

const CartItem = ({ item, onQuantityChange, onRemove }) => {
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
      </div>

      {/* Quantity Control */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onQuantityChange?.(item.id, item.quantity - 1)}
          className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          disabled={item.quantity <= 1}
        >
          −
        </button>
        <span className="w-8 text-center">{item.quantity}</span>
        <button
          onClick={() => onQuantityChange?.(item.id, item.quantity + 1)}
          className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
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
