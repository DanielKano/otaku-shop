import { createContext, useState, useCallback, useContext } from 'react'
import { NotificationContext } from './NotificationContext'

export const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([])
  const { addNotification } = useContext(NotificationContext) || { addNotification: () => {} }

  const addItem = useCallback((product, quantity = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id)
      const maxStock = product.stock || 0

      if (existingItem) {
        // Validar que no se exceda el stock disponible
        const newQuantity = existingItem.quantity + quantity
        const limitedQuantity = Math.min(newQuantity, maxStock)
        
        if (newQuantity > maxStock) {
          addNotification?.({
            message: `⚠️ Stock insuficiente. Solo hay ${maxStock} unidades disponibles de "${product.name}"`,
            type: 'warning'
          })
        }

        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: limitedQuantity }
            : item,
        )
      }

      // Para nuevo producto, validar stock desde el inicio
      const limitedQuantity = Math.min(quantity, maxStock)
      
      if (quantity > maxStock) {
        addNotification?.({
          message: `⚠️ Stock insuficiente. Solo hay ${maxStock} unidades disponibles de "${product.name}"`,
          type: 'warning'
        })
      }

      return [...prevItems, { ...product, quantity: limitedQuantity }]
    })
  }, [addNotification])

  const removeItem = useCallback((productId) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === productId) {
          const maxStock = item.stock || 0
          const limitedQuantity = Math.min(quantity, maxStock)
          
          if (quantity > maxStock) {
            addNotification?.({
              message: `⚠️ Stock máximo alcanzado. Solo hay ${maxStock} unidades disponibles de "${item.name}"`,
              type: 'warning'
            })
          }
          
          return { ...item, quantity: limitedQuantity }
        }
        return item
      }),
    )
  }, [removeItem, addNotification])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const value = {
    items,
    total,
    itemCount: items.length,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
