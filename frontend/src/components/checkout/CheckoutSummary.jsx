/**
 * 🛒 COMPONENTE CHECKOUT SUMMARY
 * Valida stock antes del pago y muestra confirmación
 */

import { useCallback, useMemo } from 'react'
import { useContext } from 'react'
import { CartContext } from '../../context/CartContext'
import { NotificationContext } from '../../context/NotificationContext'
import useCartValidations from '../../hooks/useCartValidations'
import Alert from '../ui/Alert'
import Button from '../ui/Button'

const CheckoutSummary = ({ onCheckout, isLoading = false }) => {
  const { items, validateCheckout } = useContext(CartContext)
  const { addNotification } = useContext(NotificationContext)
  const { validateCheckoutSummary } = useCartValidations()

  const checkoutValidation = useMemo(() => validateCheckoutSummary(), [validateCheckoutSummary])

  const handleCheckout = useCallback(async () => {
    // Validar que hay items en el carrito
    if (items.length === 0) {
      addNotification?.({
        message: 'El carrito está vacío. Agrega productos antes de continuar.',
        type: 'warning'
      })
      return
    }

    // Validar stock disponible una última vez
    const validation = validateCheckout()
    
    if (!validation.allValid) {
      const errors = validation.details
        .filter(d => !d.hasEnoughStock)
        .map(d => `${d.name} - No hay suficiente stock`)
        .join('\n')
      
      addNotification?.({
        message: `No se puede completar la compra:\n${errors}`,
        type: 'error'
      })
      return
    }

    // Validar con el hook
    if (!checkoutValidation.isValid) {
      const errorList = checkoutValidation.errors.join('\n')
      addNotification?.({
        message: `Problemas detectados:\n${errorList}`,
        type: 'error'
      })
      return
    }

    // Mostrar advertencias si existen
    if (checkoutValidation.warnings.length > 0) {
      const warningList = checkoutValidation.warnings.join('\n')
      console.warn('Advertencias de checkout:', warningList)
    }

    // Proceder con el checkout
    try {
      await onCheckout?.()
      
      addNotification?.({
        message: '✅ Compra completada. Tu producto ahora está totalmente asegurado.',
        type: 'success'
      })
    } catch (error) {
      addNotification?.({
        message: `Error al procesar la compra: ${error.message}`,
        type: 'error'
      })
    }
  }, [items, validateCheckout, checkoutValidation, addNotification, onCheckout])

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">El carrito está vacío</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Errores críticos */}
      {!checkoutValidation.isValid && (
        <Alert 
          type="error" 
          title="Problemas detectados"
          message={checkoutValidation.errors.join('\n')}
          dismissible={false}
        />
      )}

      {/* Advertencias */}
      {checkoutValidation.warnings.length > 0 && (
        <Alert 
          type="warning" 
          title="Advertencias"
          message={checkoutValidation.warnings.join('\n')}
          dismissible
        />
      )}

      {/* Resumen de items */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Resumen de compra ({items.length} producto{items.length !== 1 ? 's' : ''})
        </h3>
        <div className="space-y-2 text-sm">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>{item.name} × {item.quantity}</span>
              <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Botón de checkout */}
      <Button
        variant="primary"
        onClick={handleCheckout}
        disabled={!checkoutValidation.isValid || isLoading}
        className="w-full"
      >
        {isLoading ? 'Procesando...' : 'Completar compra'}
      </Button>

      {/* Información adicional */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>✅ Todos los productos están reservados durante 14 días</p>
        <p>💳 Al completar la compra, los productos quedarán asegurados</p>
        <p>🔒 Tu información de pago está protegida</p>
      </div>
    </div>
  )
}

export default CheckoutSummary
