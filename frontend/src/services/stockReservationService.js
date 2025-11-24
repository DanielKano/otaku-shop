/**
 * 🔒 SERVICIO DE RESERVA TEMPORAL DE STOCK
 * Maneja reservas de stock en el carrito con expiración automática
 */

const RESERVATION_DURATION = 15 * 60 * 1000; // 15 minutos en milisegundos

class StockReservationService {
  constructor() {
    this.reservations = new Map(); // productId -> { quantity, expiresAt, timerId }
    this.loadReservations();
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
  reserveStock(productId, quantity) {
    // Cancelar timer existente si hay
    const existing = this.reservations.get(productId);
    if (existing?.timerId) {
      clearTimeout(existing.timerId);
    }

    const expiresAt = Date.now() + RESERVATION_DURATION;
    const timerId = this.scheduleExpiration(productId, RESERVATION_DURATION);

    this.reservations.set(productId, {
      quantity,
      expiresAt,
      timerId
    });

    this.saveReservations();

    return {
      productId,
      quantity,
      expiresAt,
      expiresIn: RESERVATION_DURATION
    };
  }

  /**
   * Actualiza la cantidad reservada de un producto
   */
  updateReservation(productId, newQuantity) {
    const existing = this.reservations.get(productId);
    if (!existing) {
      return this.reserveStock(productId, newQuantity);
    }

    // Mantener el mismo tiempo de expiración, solo actualizar cantidad
    existing.quantity = newQuantity;
    this.saveReservations();

    return {
      productId,
      quantity: newQuantity,
      expiresAt: existing.expiresAt,
      expiresIn: existing.expiresAt - Date.now()
    };
  }

  /**
   * Libera la reserva de un producto
   */
  releaseReservation(productId) {
    const existing = this.reservations.get(productId);
    if (existing?.timerId) {
      clearTimeout(existing.timerId);
    }

    this.reservations.delete(productId);
    this.saveReservations();
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
