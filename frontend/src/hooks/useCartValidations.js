/**
 * 🪝 HOOK PARA VALIDACIONES DEL CARRITO
 * Maneja validaciones comunes del carrito como límites de cantidad, stock disponible, etc.
 */

import { useCallback, useContext } from 'react'
import { CartContext } from '../context/CartContext'
import stockReservationService from '../services/stockReservationService'

const MAX_UNITS_PER_PRODUCT = 10
const RESERVATION_DURATION_DAYS = 14

export const useCartValidations = () => {
  const { items } = useContext(CartContext)

  /**
   * Valida si se puede agregar una cantidad a un producto
   * @param {Object} product - Producto a validar
   * @param {number} quantity - Cantidad a agregar
   * @returns {Object} { valid: boolean, error?: string, type?: string }
   */
  const validateAddQuantity = useCallback((product, quantity = 1) => {
    const existingItem = items.find((item) => item.id === product.id)
    const currentQuantity = existingItem?.quantity || 0
    const newTotal = currentQuantity + quantity

    // Validación 1: No exceder 10 unidades
    if (newTotal > MAX_UNITS_PER_PRODUCT) {
      return {
        valid: false,
        error: `Solo puedes reservar hasta ${MAX_UNITS_PER_PRODUCT} unidades de este producto.`,
        type: 'warning'
      }
    }

    // Validación 2: Verificar stock disponible
    const reserved = stockReservationService.getReservedQuantity(product.id)
    const totalStock = product.stock || 0
    const availableStock = totalStock - reserved

    if (quantity > availableStock) {
      return {
        valid: false,
        error: `No hay suficiente stock disponible. Stock disponible: ${availableStock} unidades.`,
        type: 'error'
      }
    }

    return { valid: true }
  }, [items])

  /**
   * Valida si se puede cambiar la cantidad de un producto en el carrito
   * @param {number} productId - ID del producto
   * @param {number} newQuantity - Nueva cantidad
   * @returns {Object} { valid: boolean, message?: string, type?: string }
   */
  const validateUpdateQuantity = useCallback((productId, newQuantity) => {
    const item = items.find((i) => i.id === productId)
    if (!item) {
      return { valid: false, message: 'Producto no encontrado en el carrito.' }
    }

    // No permitir cantidad <= 0
    if (newQuantity <= 0) {
      return { valid: true, message: 'Se eliminará el producto del carrito.' }
    }

    // No exceder 10 unidades
    if (newQuantity > MAX_UNITS_PER_PRODUCT) {
      return {
        valid: false,
        message: `No puedes reservar más de ${MAX_UNITS_PER_PRODUCT} unidades.`,
        type: 'warning'
      }
    }

    const oldQuantity = item.quantity
    const quantityDifference = newQuantity - oldQuantity

    // Si es aumento, validar stock disponible
    if (quantityDifference > 0) {
      const reserved = stockReservationService.getReservedQuantity(productId)
      const totalStock = item.stock || 0
      const availableStock = totalStock - reserved

      if (quantityDifference > availableStock) {
        return {
          valid: false,
          message: `No hay suficiente stock para aumentar la cantidad. Stock disponible: ${availableStock}`,
          type: 'error'
        }
      }

      return {
        valid: true,
        message: `Cantidad actualizada y reserva ampliada.`,
        type: 'success'
      }
    }

    // Si es reducción
    if (quantityDifference < 0) {
      return {
        valid: true,
        message: `Cantidad reducida. La reserva liberada vuelve al inventario.`,
        type: 'info'
      }
    }

    return { valid: true }
  }, [items])

  /**
   * Obtiene información de stock disponible de un producto
   * @param {number} productId - ID del producto
   * @returns {Object} { totalStock, reserved, available }
   */
  const getStockInfo = useCallback((productId) => {
    const item = items.find((i) => i.id === productId)
    if (!item) return null

    const totalStock = item.stock || 0
    const reserved = stockReservationService.getReservedQuantity(productId)
    const available = totalStock - reserved

    return {
      totalStock,
      reserved,
      available,
      isLowStock: available < 5
    }
  }, [items])

  /**
   * Valida si una reserva ha expirado
   * @param {number} productId - ID del producto
   * @returns {boolean}
   */
  const isReservationExpired = useCallback((productId) => {
    const reservation = stockReservationService.getReservationInfo(productId)
    return !reservation
  }, [])

  /**
   * Obtiene tiempo restante de una reserva
   * @param {number} productId - ID del producto
   * @returns {Object|null} { remainingDays, remainingHours, remainingMinutes } o null si no existe
   */
  const getReservationTimeRemaining = useCallback((productId) => {
    const reservation = stockReservationService.getReservationInfo(productId)
    if (!reservation) return null

    const remainingMs = reservation.expiresIn
    const remainingDays = Math.floor(remainingMs / (24 * 60 * 60 * 1000))
    const remainingHours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    const remainingMinutes = Math.ceil((remainingMs % (60 * 1000)) / 60000)

    return {
      totalMs: remainingMs,
      days: remainingDays,
      hours: remainingHours,
      minutes: remainingMinutes,
      formatted: `${remainingDays}d ${remainingHours}h`
    }
  }, [])

  /**
   * Calcula el resumen de validación para checkout
   * @returns {Object} { isValid, errors, warnings }
   */
  const validateCheckoutSummary = useCallback(() => {
    const errors = []
    const warnings = []

    items.forEach((item) => {
      const reserved = stockReservationService.getReservedQuantity(item.id)

      // Verificar si la reserva sigue siendo válida
      if (reserved === 0) {
        errors.push(`${item.name} - La reserva ha expirado.`)
      } else if (reserved < item.quantity) {
        errors.push(`${item.name} - Stock insuficiente. Cantidad: ${item.quantity}, Reservado: ${reserved}`)
      }

      // Avisos
      const timeRemaining = getReservationTimeRemaining(item.id)
      if (timeRemaining && timeRemaining.days === 0 && timeRemaining.hours < 6) {
        warnings.push(`${item.name} - La reserva vence en menos de 6 horas.`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      totalItems: items.length
    }
  }, [items, getReservationTimeRemaining])

  return {
    validateAddQuantity,
    validateUpdateQuantity,
    getStockInfo,
    isReservationExpired,
    getReservationTimeRemaining,
    validateCheckoutSummary,
    MAX_UNITS_PER_PRODUCT,
    RESERVATION_DURATION_DAYS
  }
}

export default useCartValidations
