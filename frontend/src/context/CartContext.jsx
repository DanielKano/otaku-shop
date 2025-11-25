import { createContext, useState, useCallback, useContext, useEffect } from 'react'
import { NotificationContext } from './NotificationContext'
import { AuthContext } from './AuthContext'
import stockReservationService from '../services/stockReservationService'
import api from '../services/api'

export const CartContext = createContext()

const MAX_UNITS_PER_PRODUCT = 10
const RESERVATION_DURATION_DAYS = 14
const CART_STORAGE_KEY = 'otaku_shop_cart'

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([])
  const [syncedWithBackend, setSyncedWithBackend] = useState(false)
  const { addNotification } = useContext(NotificationContext) || { addNotification: () => {} }
  const { user } = useContext(AuthContext) || {}

  /**
   * 🔄 Cargar carrito desde localStorage al inicializar
   */
  const loadCartFromStorage = useCallback(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart)
        setItems(parsedCart)
      }
    } catch (error) {
      console.warn('Error loading cart from storage:', error)
    }
  }, [])

  /**
   * 💾 Guardar carrito en localStorage siempre que cambie
   */
  const saveCartToStorage = useCallback((cartItems) => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
    } catch (error) {
      console.warn('Error saving cart to storage:', error)
    }
  }, [])

  /**
   * 🔄 Sincronizar carrito con el backend
   */
  const syncCartWithBackend = useCallback(async () => {
    if (!user?.id) {
      setSyncedWithBackend(false)
      return
    }

    try {
      // Obtener carrito actual del backend
      const response = await api.get('/cart')
      if (response.data?.items) {
        setItems(response.data.items)
        saveCartToStorage(response.data.items)
        setSyncedWithBackend(true)
      }
    } catch (error) {
      console.warn('Error syncing cart with backend:', error)
      // Si el backend falla, usar localStorage
      loadCartFromStorage()
    }
  }, [user?.id, saveCartToStorage, loadCartFromStorage])

  /**
   * 📥 Cargar carrito al inicializar o cuando el usuario cambia
   */
  useEffect(() => {
    if (user?.id) {
      // Si hay usuario autenticado, sincronizar con backend
      syncCartWithBackend()
    } else {
      // Si no hay usuario, cargar desde localStorage
      loadCartFromStorage()
    }
  }, [user?.id, syncCartWithBackend, loadCartFromStorage])

  /**
   * 🔍 Valida si se puede agregar la cantidad solicitada
   */
  const validateAddQuantity = (product, newQuantity, existingQuantity = 0) => {
    const totalQuantity = existingQuantity + newQuantity
    const totalStock = product.stock || 0
    const reserved = stockReservationService.getReservedQuantity(product.id)
    const availableStock = totalStock - reserved

    // Validación 1: No exceder 10 unidades por producto
    if (totalQuantity > MAX_UNITS_PER_PRODUCT) {
      return {
        valid: false,
        error: `Solo puedes reservar hasta ${MAX_UNITS_PER_PRODUCT} unidades de este producto.`,
        type: 'warning'
      }
    }

    // Validación 2: Verificar stock disponible
    if (newQuantity > availableStock) {
      return {
        valid: false,
        error: 'No hay suficiente stock disponible en este momento.',
        type: 'error'
      }
    }

    return { valid: true }
  }

  const addItem = useCallback(async (product, quantity = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id)
      const existingQuantity = existingItem?.quantity || 0

      // Validar cantidad
      const validation = validateAddQuantity(product, quantity, existingQuantity)
      
      if (!validation.valid) {
        addNotification?.({
          message: validation.error,
          type: validation.type
        })
        return prevItems
      }

      const newQuantity = existingQuantity + quantity

      if (existingItem) {
        // Actualizar reserva existente
        stockReservationService.updateReservation(product.id, newQuantity)
        
        // Si hay usuario, sincronizar con backend
        if (user?.id) {
          api.put(`/cart/${product.id}`, { quantity: newQuantity }).catch(error => {
            console.warn('Error updating cart in backend:', error)
          })
        }
        
        addNotification?.({
          message: `✅ ${product.name} - Cantidad: ${newQuantity} unidades. Reservado durante ${RESERVATION_DURATION_DAYS} días. Completa la compra para asegurar tu unidad.`,
          type: 'success'
        })

        const updatedItems = prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: newQuantity, reservedAt: item.reservedAt || new Date(), stock: product.stock }
            : item,
        )
        saveCartToStorage(updatedItems)
        return updatedItems
      }

      // Crear nueva reserva
      stockReservationService.reserveStock(product.id, newQuantity)
      
      // Si hay usuario, agregar al carrito en el backend
      if (user?.id) {
        api.post('/cart/add', {
          productId: product.id,
          quantity: newQuantity
        }).catch(error => {
          console.warn('Error adding item to backend cart:', error)
        })
      }
      
      addNotification?.({
        message: `✅ Producto reservado durante ${RESERVATION_DURATION_DAYS} días. Completa la compra para asegurar tu unidad.`,
        type: 'success'
      })

      const newItems = [
        ...prevItems,
        {
          ...product,
          quantity: newQuantity,
          reservedAt: new Date(),
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        }
      ]
      saveCartToStorage(newItems)
      return newItems
    })
  }, [addNotification, user?.id, validateAddQuantity, saveCartToStorage])

  const removeItem = useCallback((productId) => {
    setItems((prevItems) => {
      const item = prevItems.find((i) => i.id === productId)
      
      if (item) {
        // Liberar la reserva
        stockReservationService.releaseReservation(productId)
        
        // Si hay usuario, eliminar del carrito en el backend
        if (user?.id) {
          api.delete(`/cart/${productId}`).catch(error => {
            console.warn('Error removing item from backend cart:', error)
          })
        }
        
        addNotification?.({
          message: `Producto eliminado del carrito. La reserva fue liberada y el stock volvió al inventario.`,
          type: 'info'
        })
      }

      const updatedItems = prevItems.filter((item) => item.id !== productId)
      saveCartToStorage(updatedItems)
      return updatedItems
    })
  }, [addNotification, user?.id, saveCartToStorage])

  /**
   * 🔄 Actualizar cantidad con validaciones de cambio
   */
  const updateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId)
      return
    }

    setItems((prevItems) => {
      const item = prevItems.find((i) => i.id === productId)
      if (!item) return prevItems

      const oldQuantity = item.quantity
      const quantityDifference = newQuantity - oldQuantity

      // Validar nueva cantidad
      if (newQuantity > MAX_UNITS_PER_PRODUCT) {
        addNotification?.({
          message: `No puedes reservar más de ${MAX_UNITS_PER_PRODUCT} unidades.`,
          type: 'warning'
        })
        return prevItems
      }

      // Validar si hay stock disponible para el aumento
      if (quantityDifference > 0) {
        const reserved = stockReservationService.getReservedQuantity(productId)
        const totalStock = item.stock || 0
        const availableStock = totalStock - reserved

        if (quantityDifference > availableStock) {
          addNotification?.({
            message: `No hay suficiente stock para aumentar la cantidad.`,
            type: 'error'
          })
          return prevItems
        }

        // Actualizar reserva con nueva cantidad
        stockReservationService.updateReservation(productId, newQuantity)
        
        // Si hay usuario, sincronizar con backend
        if (user?.id) {
          api.put(`/cart/${productId}`, { quantity: newQuantity }).catch(error => {
            console.warn('Error updating cart in backend:', error)
          })
        }

        addNotification?.({
          message: `Cantidad actualizada y reserva ampliada. Nueva cantidad: ${newQuantity} unidades.`,
          type: 'success'
        })
      } else if (quantityDifference < 0) {
        // Si la cantidad disminuye, liberar stock de la reserva
        stockReservationService.updateReservation(productId, newQuantity)
        
        // Si hay usuario, sincronizar con backend
        if (user?.id) {
          api.put(`/cart/${productId}`, { quantity: newQuantity }).catch(error => {
            console.warn('Error updating cart in backend:', error)
          })
        }

        addNotification?.({
          message: `Cantidad reducida. La reserva liberada vuelve al inventario.`,
          type: 'info'
        })
      }

      const updatedItems = prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
      saveCartToStorage(updatedItems)
      return updatedItems
    })
  }, [removeItem, addNotification, user?.id, saveCartToStorage])

  const clearCart = useCallback(async () => {
    // Liberar todas las reservas
    items.forEach((item) => {
      stockReservationService.releaseReservation(item.id)
    })
    
    // Si hay usuario, limpiar el carrito en el backend
    if (user?.id) {
      try {
        await api.delete('/cart/clear')
      } catch (error) {
        console.warn('Error clearing backend cart:', error)
      }
    }
    
    setItems([])
    saveCartToStorage([])
  }, [items, user?.id, saveCartToStorage])

  /**
   * 🔒 Validar stock antes del checkout
   */
  const validateCheckout = () => {
    const validationResults = items.map((item) => {
      const reserved = stockReservationService.getReservedQuantity(item.id)
      const totalStock = item.stock || 0
      const hasEnoughStock = reserved >= item.quantity && item.quantity <= totalStock

      return {
        id: item.id,
        name: item.name,
        hasEnoughStock,
        reserved,
        requested: item.quantity,
        available: totalStock - reserved
      }
    })

    const allValid = validationResults.every((r) => r.hasEnoughStock)
    return { allValid, details: validationResults }
  }

  /**
   * 🔄 Refrescar datos del carrito desde el servidor (para sincronizar después de cambios externos)
   */
  const refreshCartData = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        // Actualizar stock en items locales si es necesario
        setItems((prevItems) =>
          prevItems.map((item) => {
            const updatedProduct = data.products?.find((p) => p.id === item.id)
            return updatedProduct ? { ...item, stock: updatedProduct.stock } : item
          })
        )
      }
    } catch (error) {
      console.error('Error refreshing cart data:', error)
    }
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const value = {
    items,
    total,
    itemCount: items.length,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    validateCheckout,
    refreshCartData,
    syncCartWithBackend,
    syncedWithBackend,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
