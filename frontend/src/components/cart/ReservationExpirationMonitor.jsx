/**
 * 🕐 COMPONENTE PARA MANEJO DE EXPIRACIÓN DE RESERVAS
 * Monitorea reservas expiradas y las elimina del carrito automáticamente
 */

import { useEffect, useContext, useCallback } from 'react'
import { CartContext } from '../../context/CartContext'
import { NotificationContext } from '../../context/NotificationContext'
import { useAllReservations } from '../../hooks/useStockReservation'
import stockReservationService from '../../services/stockReservationService'

const ReservationExpirationMonitor = () => {
  const { items, removeItem } = useContext(CartContext)
  const { addNotification } = useContext(NotificationContext)
  const { reservations, cleanupExpiredReservations } = useAllReservations()

  /**
   * Monitorear y limpiar reservas expiradas
   */
  useEffect(() => {
    if (items.length === 0) return

    const checkExpiredReservations = () => {
      items.forEach((item) => {
        const reservation = stockReservationService.getReservationInfo(item.id)
        
        // Si la reserva expiró
        if (!reservation) {
          removeItem(item.id)
          
          addNotification?.({
            message: `⏰ Tu reserva de "${item.name}" ha expirado. El producto volvió al inventario público.`,
            type: 'warning'
          })
        }
      })
    }

    // Chequear cada minuto
    const interval = setInterval(checkExpiredReservations, 60000)
    
    // Chequear al montar el componente
    checkExpiredReservations()

    return () => clearInterval(interval)
  }, [items, removeItem, addNotification])

  /**
   * Escuchar evento global de expiración
   */
  useEffect(() => {
    const handleReservationExpired = (event) => {
      const { productId } = event.detail
      const item = items.find((i) => i.id === productId)
      
      if (item) {
        removeItem(productId)
        
        addNotification?.({
          message: `⏰ Tu reserva de "${item.name}" ha expirado. El producto volvió al inventario público.`,
          type: 'warning'
        })
      }
    }

    window.addEventListener('reservation_expired', handleReservationExpired)
    return () => window.removeEventListener('reservation_expired', handleReservationExpired)
  }, [items, removeItem, addNotification])

  // Este componente no renderiza nada, solo maneja lógica
  return null
}

export default ReservationExpirationMonitor
