/**
 * 📝 EJEMPLO DE INTEGRACIÓN DEL SISTEMA DE RESERVAS
 * Copia estos ejemplos en tus archivos correspondientes
 */

// ============================================================
// 1. En tu App.jsx o Layout Principal
// ============================================================

import { CartProvider } from './context/CartContext'
import { NotificationProvider } from './context/NotificationContext'
import ReservationExpirationMonitor from './components/cart/ReservationExpirationMonitor'
import Router from './routes'

function App() {
  return (
    <NotificationProvider>
      <CartProvider>
        {/* Componente que monitorea automáticamente las reservas expiradas */}
        <ReservationExpirationMonitor />
        
        {/* Tu contenido de la aplicación */}
        <Router />
      </CartProvider>
    </NotificationProvider>
  )
}

export default App


// ============================================================
// 2. En tu Página de Carrito
// ============================================================

import { useContext } from 'react'
import { CartContext } from '../context/CartContext'
import CartItem from '../components/cart/CartItem'
import CartSummary from '../components/cart/CartSummary'
import CheckoutSummary from '../components/checkout/CheckoutSummary'

function CartPage() {
  const { items, updateQuantity, removeItem } = useContext(CartContext)

  const handleCheckout = async () => {
    try {
      // Aquí procesa el pago con tu backend
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      })

      if (!response.ok) throw new Error('Error al procesar pago')
      
      // El usuario verá la notificación de éxito en CheckoutSummary
      // Redirigir a página de confirmación
      window.location.href = '/order-confirmation'
    } catch (error) {
      console.error('Error:', error)
      // Las notificaciones de error se manejan en CheckoutSummary
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Tu carrito está vacío</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Mi Carrito</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de productos */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onQuantityChange={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>
        </div>

        {/* Resumen y checkout */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-4">
            <CheckoutSummary onCheckout={handleCheckout} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage


// ============================================================
// 3. En tu Componente de Producto
// ============================================================

import { useState } from 'react'
import { useContext } from 'react'
import { CartContext } from '../context/CartContext'
import useCartValidations from '../hooks/useCartValidations'
import Button from '../components/ui/Button'

function ProductCard({ product }) {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useContext(CartContext)
  const { validateAddQuantity } = useCartValidations()

  const handleAddToCart = () => {
    // Opcional: validar antes de agregar
    // Nota: CartContext.addItem también hace validación
    const validation = validateAddQuantity(product, quantity)
    
    if (!validation.valid) {
      console.log('Validación fallida:', validation.error)
      // La notificación ya se mostrará en CartContext
      return
    }

    // Agregar al carrito (las notificaciones se muestran automáticamente)
    addItem(product, quantity)
    
    // Resetear cantidad
    setQuantity(1)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <img 
        src={product.image} 
        alt={product.name}
        className="w-full h-48 object-cover rounded mb-4"
      />
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {product.name}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
        {product.description}
      </p>

      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          ${product.price.toFixed(2)}
        </span>
        <span className="text-sm text-gray-500">
          Stock: {product.stock}
        </span>
      </div>

      {/* Selector de cantidad */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
        >
          −
        </button>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-16 text-center border rounded px-2 py-1"
          min="1"
          max="10"
        />
        <button
          onClick={() => setQuantity(Math.min(10, quantity + 1))}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
        >
          +
        </button>
      </div>

      <Button
        variant="primary"
        onClick={handleAddToCart}
        className="w-full"
      >
        🛒 Agregar al Carrito
      </Button>

      {/* Información de reserva */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-700 dark:text-blue-300">
        <p className="font-semibold">🔒 Sistema de Reserva</p>
        <p>Se reservará durante 14 días. Completa la compra para asegurar tu unidad.</p>
      </div>
    </div>
  )
}

export default ProductCard


// ============================================================
// 4. En tu Hook Personalizado (Ejemplo Avanzado)
// ============================================================

import { useContext, useCallback } from 'react'
import { CartContext } from '../context/CartContext'
import useCartValidations from './useCartValidations'
import { NotificationContext } from '../context/NotificationContext'

/**
 * Hook personalizado para manejar lógica de carrito
 */
export const useCartManager = () => {
  const { items, addItem, removeItem, updateQuantity } = useContext(CartContext)
  const { addNotification } = useContext(NotificationContext)
  const { validateAddQuantity, getReservationTimeRemaining } = useCartValidations()

  /**
   * Agregar producto con validación personalizada
   */
  const addProductToCart = useCallback((product, quantity = 1, customValidation = null) => {
    // Validación personalizada (opcional)
    if (customValidation && !customValidation(product, quantity)) {
      return false
    }

    // Validación estándar
    const validation = validateAddQuantity(product, quantity)
    if (!validation.valid) {
      addNotification?.({
        message: validation.error,
        type: validation.type
      })
      return false
    }

    // Agregar al carrito
    addItem(product, quantity)
    return true
  }, [addItem, validateAddQuantity, addNotification])

  /**
   * Obtener resumen de un item con información de reserva
   */
  const getItemSummary = useCallback((itemId) => {
    const item = items.find((i) => i.id === itemId)
    if (!item) return null

    const timeRemaining = getReservationTimeRemaining(itemId)

    return {
      ...item,
      timeRemaining,
      isExpiringsoon: timeRemaining && timeRemaining.days === 0 && timeRemaining.hours < 6
    }
  }, [items, getReservationTimeRemaining])

  /**
   * Obtener todos los items con información de reserva
   */
  const getCartSummary = useCallback(() => {
    return items.map((item) => ({
      ...item,
      timeRemaining: getReservationTimeRemaining(item.id),
      isExpiringSoon: getReservationTimeRemaining(item.id)?.days === 0 && 
                      getReservationTimeRemaining(item.id)?.hours < 6
    }))
  }, [items, getReservationTimeRemaining])

  return {
    items,
    addProductToCart,
    removeItem,
    updateQuantity,
    getItemSummary,
    getCartSummary
  }
}

export default useCartManager
