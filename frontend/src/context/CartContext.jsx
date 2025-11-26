import { createContext, useState, useCallback, useContext, useEffect } from 'react'
import { NotificationContext } from './NotificationContext'
import { AuthContext } from './AuthContext'

import api from '../services/api'

export const CartContext = createContext()

const MAX_UNITS_PER_PRODUCT = 10
const RESERVATION_DURATION_DAYS = 14
const CART_STORAGE_KEY = 'otaku_shop_cart'

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([])
  const [syncedWithBackend, setSyncedWithBackend] = useState(false)
  const { addNotification } = useContext(NotificationContext) || { addNotification: () => {} }
  const { user, isLoading: authLoading } = useContext(AuthContext) || { user: null, isLoading: true }
  
  useEffect(() => {
    console.debug('[CartContext] Auth state changed:', { user: user ? { id: user.id, name: user.name } : null, authLoading })
  }, [user, authLoading])

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
        // ✅ CRITICAL: Map backend CartItemDTO to frontend structure
        // Backend returns: { id, productId, productName, productPrice, productImage, quantity, ... }
        // Frontend needs: { id (as cartItemId), productId, productName, productPrice, productImage, quantity, ... }
        const mappedItems = response.data.items.map(item => ({
          ...item,
          cartItemId: item.id, // ✅ Store backend ID as cartItemId for PUT/DELETE operations
          id: item.productId, // ✅ Use productId as local id for React keys
        }))
        console.debug('[CartContext] syncCartWithBackend mapped items:', mappedItems)
        setItems(mappedItems)
        saveCartToStorage(mappedItems)
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
    console.debug('[CartContext] useEffect: user?.id =', user?.id)
    if (user?.id) {
      // Si hay usuario autenticado, sincronizar con backend
      console.debug('[CartContext] Syncing cart with backend for user', user.id)
      syncCartWithBackend()
    } else {
      // Si no hay usuario, cargar desde localStorage
      console.debug('[CartContext] Loading cart from localStorage (no user)')
      loadCartFromStorage()
    }
  }, [user?.id, syncCartWithBackend, loadCartFromStorage])

  /**
   * 🔍 Valida si se puede agregar la cantidad solicitada
   */
  const validateAddQuantity = (product, newQuantity, existingQuantity = 0) => {
    const totalQuantity = existingQuantity + newQuantity
    const productStock = product.stock || 0

    // Validación 1: No exceder 10 unidades por producto
    if (totalQuantity > MAX_UNITS_PER_PRODUCT) {
      return {
        valid: false,
        error: `Solo puedes reservar hasta ${MAX_UNITS_PER_PRODUCT} unidades de este producto.`,
        type: 'warning'
      }
    }

    // Validación 2: Verificar stock disponible
    if (newQuantity > productStock) {
      return {
        valid: false,
        error: `No hay suficiente stock disponible (disponible: ${productStock})`,
        type: 'error'
      }
    }

    return { valid: true }
  }

  const addItem = useCallback((product, quantity = 1) => {
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
        addNotification?.({
          message: `✅ ${product.name} - Cantidad: ${newQuantity} unidades.`,
          type: 'success'
        })

        const updatedItems = prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: newQuantity, productStock: product.stock }
            : item,
        )
        saveCartToStorage(updatedItems)
        return updatedItems
      }

      addNotification?.({
        message: `✅ Producto reservado durante ${RESERVATION_DURATION_DAYS} días.`,
        type: 'success'
      })

      const newItems = [
        ...prevItems,
        {
          id: product.id,
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          productImage: product.imageUrl || product.image,
          productStock: product.stock,
          category: product.category,
          quantity: quantity, // ← Guardar solo la cantidad nueva, no la total
          reservedAt: new Date(),
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        }
      ]
      saveCartToStorage(newItems)
      return newItems
    })

    // ✅ CORREGIDO: Enviar solo la cantidad INCREMENTAL al backend
    if (user?.id) {
      setTimeout(() => {
        console.debug('[CartContext] calling POST /cart/add with INCREMENTAL quantity:', quantity)
        api.post('/cart/add', {
          productId: product.id,
          quantity: quantity  // ← Solo la cantidad a AGREGAR, no la total
        }).then(res => {
          console.debug('[CartContext] POST /cart/add success, syncing cart with backend')
          syncCartWithBackend()
        }).catch(error => {
          console.warn('[CartContext] Error adding item to backend cart:', error)
          syncCartWithBackend()
        })
      }, 100)
    }
  }, [addNotification, user?.id, validateAddQuantity, saveCartToStorage, syncCartWithBackend])

  const removeItem = useCallback((productId) => {
    setItems((prevItems) => {
      const item = prevItems.find((i) => i.id === productId)

      if (item) {
        addNotification?.({
          message: `Producto eliminado del carrito. La reserva fue liberada y el stock volvió al inventario.`,
          type: 'info'
        })

        // ✅ Llamar al backend de forma asíncrona DESPUÉS de actualizar estado local
        if (user?.id && item.cartItemId) {
          setTimeout(() => {
            console.debug('[CartContext] calling DELETE /cart/' + item.cartItemId)
            api.delete(`/cart/${item.cartItemId}`)
              .then(res => {
                console.debug('[CartContext] DELETE /cart response', res?.data)
              })
              .catch(error => {
                console.warn('Error removing item from backend cart:', error?.response?.data?.message || error.message)
                // Recargar el carrito si falla la eliminación
                syncCartWithBackend()
              })
          }, 50)
        }
      }

      // Filtrar el item del estado local INMEDIATAMENTE
      const updatedItems = prevItems.filter((item) => item.id !== productId)
      saveCartToStorage(updatedItems)
      return updatedItems
    })
  }, [addNotification, user?.id, saveCartToStorage, syncCartWithBackend])

  /**
   * 🔄 Actualizar cantidad con validaciones de cambio
   */
  const updateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId)
      return
    }

    // ✅ Obtener el item ANTES de actualizar
    const currentItem = items.find((i) => i.id === productId)
    if (!currentItem) {
      console.warn('[CartContext] Item not found:', productId)
      return
    }

    const oldQuantity = currentItem.quantity
    const quantityDifference = newQuantity - oldQuantity

    // Validar nueva cantidad
    if (newQuantity > MAX_UNITS_PER_PRODUCT) {
      addNotification?.({
        message: `No puedes reservar más de ${MAX_UNITS_PER_PRODUCT} unidades.`,
        type: 'warning'
      })
      return
    }

    // Validar si hay stock disponible para el aumento
    if (quantityDifference > 0) {
      const productStock = currentItem.productStock || currentItem.stock || 0

      console.debug('[CartContext] updateQuantity increase check', {
        productId,
        oldQuantity,
        newQuantity,
        quantityDifference,
        productStock,
      })

      if (newQuantity > productStock) {
        const msg = `No hay suficiente stock. Disponible: ${productStock}, solicitado: ${newQuantity}`
        console.warn('[CartContext] ' + msg)
        addNotification?.({
          message: msg,
          type: 'error'
        })
        return
      }
    }

    // ✅ Mostrar notificación apropiada
    if (quantityDifference > 0) {
      addNotification?.({
        message: `✅ Cantidad actualizada a ${newQuantity} unidades.`,
        type: 'success'
      })
    } else if (quantityDifference < 0) {
      addNotification?.({
        message: `Cantidad reducida. La reserva liberada vuelve al inventario.`,
        type: 'info'
      })
    }

    // ✅ Si hay usuario, llamar al backend PRIMERO
    if (user?.id && currentItem.cartItemId) {
      console.debug('[CartContext] calling PUT /cart/' + currentItem.cartItemId, { quantity: newQuantity })

      api
        .put(`/cart/${currentItem.cartItemId}`, { quantity: newQuantity })
        .then((res) => {
          console.debug('[CartContext] PUT /cart response:', res?.data?.cartItem)

          // ✅ Actualizar SOLO desde la respuesta del servidor
          if (res?.data?.cartItem) {
            setItems((current) => {
              const updatedItems = current.map((i) =>
                i.cartItemId === currentItem.cartItemId
                  ? {
                      ...i,
                      quantity: res.data.cartItem.quantity,
                      productStock: res.data.cartItem.productStock,
                    }
                  : i
              )
              saveCartToStorage(updatedItems)
              return updatedItems
            })
          }
        })
        .catch((error) => {
          console.error('[CartContext] Error updating cart in backend:', error?.response?.data?.message || error.message)

          // ✅ Si falla, recargar carrito del backend para sincronizar
          addNotification?.({
            message: 'Error al actualizar. Recargando carrito...',
            type: 'error'
          })
          syncCartWithBackend()
        })
    } else {
      // ✅ Si NO hay usuario, actualizar SOLO localmente
      setItems((prevItems) => {
        const updatedItems = prevItems.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
        saveCartToStorage(updatedItems)
        return updatedItems
      })
    }
  }, [items, removeItem, addNotification, user?.id, saveCartToStorage, syncCartWithBackend])

  const clearCart = useCallback(async () => {
    // Si hay usuario, limpiar el carrito en el backend
    if (user?.id) {
      try {
        console.debug('[CartContext] calling DELETE /cart (clear)')
        await api.delete('/cart')
        console.debug('[CartContext] DELETE /cart response (clear)')
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
      const totalStock = item.productStock || item.stock || 0
      const hasEnoughStock = item.quantity <= totalStock

      return {
        id: item.id,
        name: item.name,
        hasEnoughStock,
        requested: item.quantity,
        available: totalStock
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

  const total = items.reduce((sum, item) => {
    const price = item.productPrice || item.price || 0
    return sum + (price * item.quantity)
  }, 0)

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
