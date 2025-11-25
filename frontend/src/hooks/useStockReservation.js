/**
 * 🪝 CUSTOM HOOK PARA RESERVAS DE STOCK
 * Hook de React para manejar reservas temporales de stock
 */

import { useState, useEffect, useCallback } from 'react';
import stockReservationService from '../services/stockReservationService';

const MAX_UNITS_PER_PRODUCT = 10;

/**
 * Hook para manejar reserva temporal de stock de un producto
 * 
 * @param {number} productId - ID del producto
 * @param {number} totalStock - Stock total disponible del producto
 * @returns {Object} Estado y funciones de la reserva
 */
export const useStockReservation = (productId, totalStock = 0) => {
  const [reservation, setReservation] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  // Cargar reserva inicial
  useEffect(() => {
    if (productId) {
      const info = stockReservationService.getReservationInfo(productId);
      setReservation(info);
      setIsExpired(!info);
    }
  }, [productId]);

  // Escuchar evento de expiración
  useEffect(() => {
    const handleExpiration = (event) => {
      if (event.detail.productId === productId) {
        setReservation(null);
        setIsExpired(true);
      }
    };

    window.addEventListener('reservation_expired', handleExpiration);
    return () => window.removeEventListener('reservation_expired', handleExpiration);
  }, [productId]);

  // Actualizar estado cada minuto
  useEffect(() => {
    if (!reservation) return;

    const interval = setInterval(() => {
      const info = stockReservationService.getReservationInfo(productId);
      setReservation(info);
      if (!info) {
        setIsExpired(true);
      }
    }, 60000); // Cada minuto

    return () => clearInterval(interval);
  }, [productId, reservation]);

  // Reservar stock
  const reserve = useCallback((quantity) => {
    const result = stockReservationService.reserveStock(productId, quantity);
    setReservation({
      ...result,
      remainingMinutes: Math.ceil(result.expiresIn / 60000)
    });
    setIsExpired(false);
    return result;
  }, [productId]);

  // Actualizar cantidad
  const updateQuantity = useCallback((newQuantity) => {
    const result = stockReservationService.updateReservation(productId, newQuantity);
    setReservation({
      ...result,
      remainingMinutes: Math.ceil(result.expiresIn / 60000)
    });
    return result;
  }, [productId]);

  // Liberar reserva
  const release = useCallback(() => {
    stockReservationService.releaseReservation(productId);
    setReservation(null);
    setIsExpired(false);
  }, [productId]);

  // Renovar reserva
  const renew = useCallback(() => {
    const result = stockReservationService.renewReservation(productId);
    if (result) {
      setReservation({
        ...result,
        remainingMinutes: Math.ceil(result.expiresIn / 60000)
      });
      setIsExpired(false);
    }
    return result;
  }, [productId]);

  // Obtener stock disponible
  const availableStock = stockReservationService.getAvailableStock(productId, totalStock);

  /**
   * Validar si se puede reservar una cantidad
   */
  const validateReservation = useCallback((quantity, currentQuantity = 0) => {
    const totalQuantity = currentQuantity + quantity;

    // Validar límite máximo de 10 unidades
    if (totalQuantity > MAX_UNITS_PER_PRODUCT) {
      return {
        valid: false,
        error: `Solo puedes reservar hasta ${MAX_UNITS_PER_PRODUCT} unidades de este producto.`,
        type: 'warning'
      };
    }

    // Validar stock disponible
    if (quantity > availableStock) {
      return {
        valid: false,
        error: `No hay suficiente stock disponible. Stock disponible: ${availableStock} unidades.`,
        type: 'error'
      };
    }

    return { valid: true };
  }, [availableStock]);

  /**
   * Obtener información de tiempo restante de la reserva
   */
  const getTimeRemaining = useCallback(() => {
    if (!reservation) return null;

    const remainingMs = reservation.expiresIn;
    const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.ceil((remainingMs % (60 * 1000)) / 60000);

    return {
      days,
      hours,
      minutes,
      formatted: `${days}d ${hours}h ${minutes}m`
    };
  }, [reservation]);

  return {
    reservation,
    isReserved: !!reservation,
    isExpired,
    availableStock,
    reserve,
    updateQuantity,
    release,
    renew,
    validateReservation,
    getTimeRemaining,
    MAX_UNITS_PER_PRODUCT
  };
};

/**
 * Hook para manejar todas las reservas activas
 */
export const useAllReservations = () => {
  const [reservations, setReservations] = useState([]);

  // Cargar reservas iniciales
  useEffect(() => {
    const active = stockReservationService.getAllReservations();
    setReservations(active);
  }, []);

  // Escuchar expiraciones
  useEffect(() => {
    const handleExpiration = () => {
      const active = stockReservationService.getAllReservations();
      setReservations(active);
    };

    window.addEventListener('reservation_expired', handleExpiration);
    return () => window.removeEventListener('reservation_expired', handleExpiration);
  }, []);

  // Actualizar cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      const active = stockReservationService.getAllReservations();
      setReservations(active);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Limpiar todas las reservas
  const clearAll = useCallback(() => {
    stockReservationService.clearAllReservations();
    setReservations([]);
  }, []);

  /**
   * Limpiar reservas expiradas del carrito
   */
  const cleanupExpiredReservations = useCallback(() => {
    const expiredReservations = [];
    const allReservations = stockReservationService.getAllReservations();
    
    allReservations.forEach((res) => {
      if (res.expiresIn <= 0) {
        expiredReservations.push(res);
        stockReservationService.releaseReservation(res.productId);
      }
    });

    const active = stockReservationService.getAllReservations();
    setReservations(active);
    
    return expiredReservations;
  }, []);

  return {
    reservations,
    count: reservations.length,
    clearAll,
    cleanupExpiredReservations
  };
};

export default {
  useStockReservation,
  useAllReservations
};
