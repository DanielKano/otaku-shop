/**
 * 🔒 SERVICIO DE RESERVA TEMPORAL DE STOCK
 * Maneja reservas de stock en el carrito con expiración automática
 * ✅ AHORA SINCRONIZA CON BACKEND para multi-usuario
 */

import api from './api';

const RESERVATION_DURATION = 14 * 24 * 60 * 60 * 1000; // 14 días en milisegundos
const SYNC_INTERVAL = 5 * 60 * 1000; // Sincronizar cada 5 minutos

class StockReservationService {
  constructor() {
    this.reservations = new Map(); // productId -> { quantity, expiresAt, timerId, backendId? }
    this.pendingSync = new Map(); // Cambios pendientes por sincronizar
    this.loadReservations();
    this.startSyncInterval();
  }

  /**
   * Inicia sincronización periódica con el backend
   */
  startSyncInterval() {
    // Sincronizar cada 5 minutos
    this.syncIntervalId = setInterval(() => {
      this.syncWithBackend().catch(err => console.warn('Sync error:', err))
    }, SYNC_INTERVAL)
  }

  /**
   * Detiene la sincronización
   */
  stopSyncInterval() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId)
    }
  }

  /**
   * 📡 Sincroniza reservas con el backend
   */
  async syncWithBackend() {
    try {
      // Obtener token para autenticación
      const token = localStorage.getItem('token');
      if (!token) return; // Usuario no autenticado

      // Enviar todas las reservas actuales al backend
      const reservationsData = {};
      this.reservations.forEach((reservation, productId) => {
        reservationsData[productId] = {
          quantity: reservation.quantity,
          expiresAt: reservation.expiresAt,
          backendId: reservation.backendId
        };
      });

      const response = await api.post('/stock-reservations/sync', {
        reservations: reservationsData
      });

      if (response.data?.success) {
        // Actualizar IDs del backend
        response.data.reservations?.forEach(({ productId, backendId }) => {
          const reservation = this.reservations.get(productId);
          if (reservation) {
            reservation.backendId = backendId;
          }
        });
        this.saveReservations();
      }
    } catch (error) {
      // Silenciar errores de sincronización (no bloquean UI)
      console.warn('Stock reservation sync failed:', error.message);
    }
  }

  /**
   * 🔄 Recarga reservas del backend
   */
  async loadFromBackend() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return; // Usuario no autenticado

      const response = await api.get('/stock-reservations/my-reservations');
      
      if (response.data?.reservations) {
        // Limpiar reservas locales y recargar desde backend
        this.clearAllReservations();
        
        response.data.reservations.forEach(({ productId, quantity, expiresAt, id: backendId }) => {
          if (expiresAt > Date.now()) {
            const delay = expiresAt - Date.now();
            const timerId = this.scheduleExpiration(productId, delay);
            
            this.reservations.set(productId, {
              quantity,
              expiresAt,
              timerId,
              backendId
            });
          }
        });
        
        this.saveReservations();
      }
    } catch (error) {
      console.warn('Failed to load reservations from backend:', error.message);
    }
  }

  /**
   * Carga reservas desde localStorage
   */
  loadReservations() {
    try {
      const stored = localStorage.getItem('stock_reservations');

      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();

        // Filtrar reservas expiradas
        Object.entries(data).forEach(([productId, reservation]) => {
          if (reservation.expiresAt > now) {
            this.reservations.set(Number(productId), {
              ...reservation,
              timerId: this.scheduleExpiration(Number(productId), reservation.expiresAt - now)
            });
          }
        });
      }
    } catch (error) {
      console.error('Error loading stock reservations:', error);
      localStorage.removeItem('stock_reservations');
    }
  }

  /**
   * Guarda reservas en localStorage
   */
  saveReservations() {
    try {
      const data = {};
      this.reservations.forEach((reservation, productId) => {
        data[productId] = {
          quantity: reservation.quantity,
          expiresAt: reservation.expiresAt
        };
      });
      localStorage.setItem('stock_reservations', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving stock reservations:', error);
    }
  }

  /**
   * Programa la expiración de una reserva
   */
  scheduleExpiration(productId, delay) {
    return setTimeout(() => {
      this.releaseReservation(productId);
      // Notificar al usuario (opcional)
      const event = new CustomEvent('reservation_expired', { detail: { productId } });
      window.dispatchEvent(event);
    }, delay);
  }

  /**
   * Reserva stock para un producto
   */
  async reserveStock(productId, quantity) {
    try {
      // Cancelar timer existente si hay
      const existing = this.reservations.get(productId);
      if (existing?.timerId) {
        clearTimeout(existing.timerId);
      }

      // Intentar reservar en el backend
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      let backendId = null;
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          const response = await api.post('/stock-reservations/reserve', {
            productId,
            quantity,
            userId: user.id,
            sessionId: user.sessionId || null
          });
          backendId = response.data?.reservationId;
        } catch (error) {
          console.warn('Backend reservation failed, using local:', error.message);
        }
      }

      // Guardar localmente en cualquier caso (para UX responsiva)
      const expiresAt = Date.now() + RESERVATION_DURATION;
      const timerId = this.scheduleExpiration(productId, RESERVATION_DURATION);

      this.reservations.set(productId, {
        quantity,
        expiresAt,
        timerId,
        backendId
      });

      this.saveReservations();

      return {
        productId,
        quantity,
        expiresAt,
        expiresIn: RESERVATION_DURATION,
        backendId
      };
    } catch (error) {
      console.error('Error reserving stock:', error);
      throw error;
    }
  }

  /**
   * Actualiza la cantidad reservada de un producto
   */
  async updateReservation(productId, newQuantity) {
    const existing = this.reservations.get(productId);
    if (!existing) {
      return this.reserveStock(productId, newQuantity);
    }

    try {
      // Intentar actualizar en el backend
      if (existing.backendId) {
        try {
          await api.put(`/stock-reservations/${existing.backendId}/update`, {
            quantity: newQuantity
          });
        } catch (error) {
          console.warn('Backend update failed:', error.message);
        }
      }

      // Actualizar localmente
      existing.quantity = newQuantity;
      this.saveReservations();

      return {
        productId,
        quantity: newQuantity,
        expiresAt: existing.expiresAt,
        expiresIn: existing.expiresAt - Date.now()
      };
    } catch (error) {
      console.error('Error updating reservation:', error);
      throw error;
    }
  }

  /**
   * Libera la reserva de un producto
   */
  async releaseReservation(productId) {
    const existing = this.reservations.get(productId);
    
    try {
      // Intentar liberar en el backend
      if (existing?.backendId) {
        try {
          await api.delete(`/stock-reservations/${existing.backendId}`);
        } catch (error) {
          console.warn('Backend release failed:', error.message);
        }
      }

      // Liberar localmente
      if (existing?.timerId) {
        clearTimeout(existing.timerId);
      }

      this.reservations.delete(productId);
      this.saveReservations();
    } catch (error) {
      console.error('Error releasing reservation:', error);
      throw error;
    }
  }

  /**
   * Obtiene la cantidad reservada de un producto
   */
  getReservedQuantity(productId) {
    const reservation = this.reservations.get(productId);
    if (!reservation) return 0;

    // Verificar si expiró
    if (reservation.expiresAt < Date.now()) {
      this.releaseReservation(productId);
      return 0;
    }

    return reservation.quantity;
  }

  /**
   * Obtiene información de la reserva de un producto
   */
  getReservationInfo(productId) {
    const reservation = this.reservations.get(productId);
    if (!reservation) return null;

    // Verificar si expiró
    if (reservation.expiresAt < Date.now()) {
      this.releaseReservation(productId);
      return null;
    }

    return {
      productId,
      quantity: reservation.quantity,
      expiresAt: reservation.expiresAt,
      expiresIn: reservation.expiresAt - Date.now(),
      remainingMinutes: Math.ceil((reservation.expiresAt - Date.now()) / 60000)
    };
  }

  /**
   * Obtiene todas las reservas activas
   */
  getAllReservations() {
    const now = Date.now();
    const active = [];

    this.reservations.forEach((reservation, productId) => {
      if (reservation.expiresAt > now) {
        active.push({
          productId,
          quantity: reservation.quantity,
          expiresAt: reservation.expiresAt,
          expiresIn: reservation.expiresAt - now,
          remainingMinutes: Math.ceil((reservation.expiresAt - now) / 60000)
        });
      } else {
        this.releaseReservation(productId);
      }
    });

    return active;
  }

  /**
   * Renueva la expiración de una reserva (reinicia el temporizador)
   */
  renewReservation(productId) {
    const existing = this.reservations.get(productId);
    if (!existing) return null;

    // Cancelar timer existente
    if (existing.timerId) {
      clearTimeout(existing.timerId);
    }

    // Crear nueva expiración
    const expiresAt = Date.now() + RESERVATION_DURATION;
    const timerId = this.scheduleExpiration(productId, RESERVATION_DURATION);

    this.reservations.set(productId, {
      ...existing,
      expiresAt,
      timerId
    });

    this.saveReservations();

    return {
      productId,
      quantity: existing.quantity,
      expiresAt,
      expiresIn: RESERVATION_DURATION
    };
  }

  /**
   * Libera todas las reservas
   */
  clearAllReservations() {
    this.reservations.forEach((reservation) => {
      if (reservation.timerId) {
        clearTimeout(reservation.timerId);
      }
    });

    this.reservations.clear();
    localStorage.removeItem('stock_reservations');
  }

  /**
   * Verifica si hay stock disponible considerando reservas
   */
  isStockAvailable(productId, requestedQuantity, totalStock) {
    const reserved = this.getReservedQuantity(productId);
    const available = totalStock - reserved;
    return requestedQuantity <= available;
  }

  /**
   * Obtiene el stock disponible real (total - reservado)
   */
  getAvailableStock(productId, totalStock) {
    const reserved = this.getReservedQuantity(productId);
    return Math.max(0, totalStock - reserved);
  }
}

// Exportar instancia singleton
export const stockReservationService = new StockReservationService();

export default stockReservationService;
