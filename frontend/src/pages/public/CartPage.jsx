import { useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import CartList from '../../components/cart/CartList'
import CartSummary from '../../components/cart/CartSummary'
import Button from '../../components/ui/Button'

const CartPage = () => {
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity } = useCart()

  const handleQuantityChange = (productId, quantity) => {
    if (quantity > 0) {
      updateQuantity(productId, quantity)
    }
  }

  const handleRemove = (productId) => {
    removeItem(productId)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Tu Carrito
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {items.length} producto{items.length !== 1 ? 's' : ''} en tu carrito
          </p>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <CartList
                items={items}
                onRemove={handleRemove}
                onQuantityChange={handleQuantityChange}
              />
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <CartSummary
                items={items}
                onCheckout={() => navigate('/checkout')}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-6xl mb-4">🛒</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Explora nuestros productos y agrega algo a tu carrito
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/productos')}
            >
              Continuar Comprando
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartPage
