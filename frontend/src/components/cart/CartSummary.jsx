import Button from '../ui/Button'

const CartSummary = ({ items = [], onCheckout, loading = false }) => {
  // ✅ FIXED: Use item.productPrice instead of item.price
  // Backend CartItemDTO sends: productPrice, not price
  const subtotal = items.reduce((sum, item) => sum + (item.productPrice || 0) * item.quantity, 0)
  const ivaRate = 0.16
  const iva = subtotal * ivaRate
  const total = subtotal + iva

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-20">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
        Resumen
      </h3>

      <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        {/* Subtotal */}
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Envío:</span>
          <span className="text-green-600 dark:text-green-400 font-semibold">
            Gratis
          </span>
        </div>

        {/* Tax */}
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>IVA (16%):</span>
          <span>${iva.toFixed(2)}</span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          Total:
        </span>
        <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          ${total.toFixed(2)}
        </span>
      </div>

      {/* Checkout Button */}
      <Button
        variant="primary"
        size="lg"
        className="w-full mb-3"
        disabled={items.length === 0 || loading}
        onClick={onCheckout}
      >
        {loading ? 'Procesando...' : 'Confirmar Compra'}
      </Button>

      <Button
        variant="outline"
        size="lg"
        className="w-full"
        disabled={loading}
        onClick={() => (window.location.href = '/productos')}
      >
        Continuar Comprando
      </Button>

      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span>🔒</span>
          <span>Pago seguro y encriptado</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🚚</span>
          <span>Envío rápido a todo el país</span>
        </div>
        <div className="flex items-center gap-2">
          <span>↩️</span>
          <span>Devoluciones fáciles</span>
        </div>
      </div>
    </div>
  )
}

export default CartSummary
