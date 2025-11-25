import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { useNotification } from '../../hooks/useNotification'
import Button from '../../components/ui/Button'
import NeonCard from '../../components/ui/NeonCard'
import Input from '../../components/ui/Input'
import services from '../../services'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { items, total, clearCart, validateCheckout } = useCart()
  const { addNotification } = useNotification()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  })

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <p className="text-8xl mb-6">🛒</p>
          <h1 className="text-4xl font-bold neon-text mb-4">Tu carrito está vacío</h1>
          <Button
            variant="gradient"
            size="lg"
            onClick={() => navigate('/productos')}
          >
            🛍️ Continuar Comprando
          </Button>
        </div>
      </div>
    )
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // ✅ VALIDAR STOCK ANTES DE CREAR ORDEN
      const validation = validateCheckout()
      if (!validation.allValid) {
        const issues = validation.details
          .filter(d => !d.hasEnoughStock)
          .map(d => `${d.name}: necesitas ${d.requested}, disponible ${d.available}`)
          .join('; ')
        
        addNotification({
          type: 'error',
          message: `Problemas de stock: ${issues}. Por favor, ajusta tu carrito.`,
        })
        setIsLoading(false)
        return
      }

      const response = await services.orderService.create({
        items,
        shipping: formData,
        total,
      })
      clearCart()
      
      // ✅ Disparar evento para que ProductsPage recargue productos
      window.dispatchEvent(new CustomEvent('order_created', { detail: { orderId: response.data.orderId } }))
      
      addNotification({
        type: 'success',
        message: 'Compra realizada exitosamente',
      })
      setTimeout(() => {
        navigate(`/cliente/ordenes/${response.data.orderId}`)
      }, 2000)
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Error al procesar la compra',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-5xl font-bold neon-text mb-8 animate-fade-in">
          💳 Checkout
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Address */}
              <NeonCard neonColor="purple" className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  📦 Dirección de Envío
                </h2>
                <Input
                  label="Dirección"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Ciudad"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Código Postal"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                />
              </NeonCard>

              {/* Payment Info */}
              <NeonCard neonColor="cyan" className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  💳 Información de Pago
                </h2>
                <Input
                  label="Número de Tarjeta"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Vencimiento (MM/YY)"
                    name="expiryDate"
                    placeholder="12/25"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="CVV"
                    name="cvv"
                    type="password"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={handleChange}
                    required
                  />
                </div>
              </NeonCard>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                loading={isLoading}
                disabled={isLoading}
              >
                Completar Compra
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <NeonCard neonColor="gradient" className="p-6 sticky top-20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                📝 Resumen
              </h2>
              <div className="space-y-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Envío</span>
                  <span className="text-green-600">Gratis</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">IVA (16%)</span>
                  <span>${(total * 0.16).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Total</span>
                  <span>${(total + total * 0.16).toFixed(2)}</span>
                </div>
              </div>
            </NeonCard>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
