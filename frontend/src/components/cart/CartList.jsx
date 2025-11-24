import CartItem from './CartItem'

const CartList = ({ items = [], onQuantityChange, onRemove }) => {
  if (!items || items.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-2xl text-gray-600 dark:text-gray-400 mb-4">
          🛒
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Tu carrito está vacío
        </p>
        <a
          href="/productos"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continuar comprando
        </a>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Tu Carrito ({items.length} productos)
      </h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  )
}

export default CartList
