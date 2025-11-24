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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold neon-text mb-3">
            🛒 Tu Carrito
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
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
          <div className="text-center py-16 animate-scale-in">
            <p className="text-8xl mb-6">🛒</p>
            <h2 className="text-4xl font-bold neon-text mb-3">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              Explora nuestros productos y agrega algo a tu carrito
            </p>
            <Button
              variant="gradient"
              size="lg"
              onClick={() => navigate('/productos')}
            >
              🛍️ Continuar Comprando
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartPage
