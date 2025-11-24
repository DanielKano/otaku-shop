package com.otakushop.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Servicio de reserva temporal de stock para carritos de compra.
 * 
 * Funcionalidad:
 * - Reserva temporal de stock por 15 minutos cuando se agrega al carrito
 * - Liberación automática de reservas expiradas
 * - Renovación de reservas activas
 * - Thread-safe usando ConcurrentHashMap
 * 
 * Flujo:
 * 1. Usuario agrega producto al carrito → reserveStock()
 * 2. Sistema verifica disponibilidad considerando reservas activas
 * 3. Reserva expira en 15 minutos si no hay checkout
 * 4. Cleanup automático cada minuto via @Scheduled
 */
@Service
@Slf4j
public class StockReservationService {
    
    // Duración de la reserva en minutos
    private static final int RESERVATION_DURATION_MINUTES = 15;
    
    // Almacenamiento: productId -> lista de reservas
    private final Map<Long, List<StockReservation>> reservations = new ConcurrentHashMap<>();
    
    /**
     * Reserva stock para un producto.
     * 
     * @param productId ID del producto
     * @param quantity Cantidad a reservar
     * @param userId ID del usuario (puede ser null para usuarios no autenticados)
     * @param sessionId ID de sesión para usuarios no autenticados
     * @return ID de la reserva creada
     * @throws IllegalArgumentException si no hay stock suficiente
     */
    public String reserveStock(Long productId, Integer quantity, Long userId, String sessionId) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
        }
        
        String reservationId = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(RESERVATION_DURATION_MINUTES);
        
        StockReservation reservation = new StockReservation(
            reservationId,
            productId,
            quantity,
            userId,
            sessionId,
            expiresAt
        );
        
        reservations.computeIfAbsent(productId, k -> new ArrayList<>()).add(reservation);
        
        log.info("Stock reservado: productId={}, quantity={}, reservationId={}, expiresAt={}", 
            productId, quantity, reservationId, expiresAt);
        
        return reservationId;
    }
    
    /**
     * Actualiza la cantidad de una reserva existente.
     * 
     * @param reservationId ID de la reserva
     * @param newQuantity Nueva cantidad
     * @return true si se actualizó, false si no se encontró la reserva
     */
    public boolean updateReservation(String reservationId, Integer newQuantity) {
        if (newQuantity == null || newQuantity <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
        }
        
        for (List<StockReservation> productReservations : reservations.values()) {
            Optional<StockReservation> found = productReservations.stream()
                .filter(r -> r.getReservationId().equals(reservationId))
                .findFirst();
            
            if (found.isPresent()) {
                StockReservation reservation = found.get();
                reservation.setQuantity(newQuantity);
                reservation.setExpiresAt(LocalDateTime.now().plusMinutes(RESERVATION_DURATION_MINUTES));
                
                log.info("Reserva actualizada: reservationId={}, newQuantity={}", 
                    reservationId, newQuantity);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Renueva el tiempo de expiración de una reserva.
     * 
     * @param reservationId ID de la reserva
     * @return true si se renovó, false si no se encontró
     */
    public boolean renewReservation(String reservationId) {
        for (List<StockReservation> productReservations : reservations.values()) {
            Optional<StockReservation> found = productReservations.stream()
                .filter(r -> r.getReservationId().equals(reservationId))
                .findFirst();
            
            if (found.isPresent()) {
                StockReservation reservation = found.get();
                reservation.setExpiresAt(LocalDateTime.now().plusMinutes(RESERVATION_DURATION_MINUTES));
                
                log.info("Reserva renovada: reservationId={}", reservationId);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Libera una reserva de stock.
     * 
     * @param reservationId ID de la reserva
     * @return true si se liberó, false si no se encontró
     */
    public boolean releaseReservation(String reservationId) {
        for (Map.Entry<Long, List<StockReservation>> entry : reservations.entrySet()) {
            List<StockReservation> productReservations = entry.getValue();
            boolean removed = productReservations.removeIf(r -> r.getReservationId().equals(reservationId));
            
            if (removed) {
                log.info("Reserva liberada: reservationId={}", reservationId);
                
                // Limpiar la lista si está vacía
                if (productReservations.isEmpty()) {
                    reservations.remove(entry.getKey());
                }
                
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Obtiene la cantidad total reservada para un producto.
     * Solo cuenta reservas activas (no expiradas).
     * 
     * @param productId ID del producto
     * @return Cantidad total reservada
     */
    public Integer getReservedQuantity(Long productId) {
        List<StockReservation> productReservations = reservations.get(productId);
        
        if (productReservations == null) {
            return 0;
        }
        
        LocalDateTime now = LocalDateTime.now();
        return productReservations.stream()
            .filter(r -> r.getExpiresAt().isAfter(now))
            .mapToInt(StockReservation::getQuantity)
            .sum();
    }
    
    /**
     * Calcula el stock disponible considerando reservas activas.
     * 
     * @param productId ID del producto
     * @param totalStock Stock total del producto
     * @return Stock disponible para nuevas reservas
     */
    public Integer getAvailableStock(Long productId, Integer totalStock) {
        Integer reserved = getReservedQuantity(productId);
        return Math.max(0, totalStock - reserved);
    }
    
    /**
     * Verifica si hay stock disponible para una cantidad específica.
     * 
     * @param productId ID del producto
     * @param quantity Cantidad deseada
     * @param totalStock Stock total del producto
     * @return true si hay stock suficiente
     */
    public boolean isStockAvailable(Long productId, Integer quantity, Integer totalStock) {
        Integer available = getAvailableStock(productId, totalStock);
        return available >= quantity;
    }
    
    /**
     * Obtiene todas las reservas activas de un usuario.
     * 
     * @param userId ID del usuario
     * @return Lista de reservas activas
     */
    public List<StockReservation> getUserReservations(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        
        return reservations.values().stream()
            .flatMap(List::stream)
            .filter(r -> userId.equals(r.getUserId()))
            .filter(r -> r.getExpiresAt().isAfter(now))
            .toList();
    }
    
    /**
     * Obtiene todas las reservas activas de una sesión (usuario no autenticado).
     * 
     * @param sessionId ID de sesión
     * @return Lista de reservas activas
     */
    public List<StockReservation> getSessionReservations(String sessionId) {
        LocalDateTime now = LocalDateTime.now();
        
        return reservations.values().stream()
            .flatMap(List::stream)
            .filter(r -> sessionId.equals(r.getSessionId()))
            .filter(r -> r.getExpiresAt().isAfter(now))
            .toList();
    }
    
    /**
     * Limpia automáticamente las reservas expiradas cada minuto.
     */
    @Scheduled(fixedRate = 60000) // Cada 60 segundos
    public void cleanupExpiredReservations() {
        LocalDateTime now = LocalDateTime.now();
        int totalRemoved = 0;
        
        for (Map.Entry<Long, List<StockReservation>> entry : reservations.entrySet()) {
            List<StockReservation> productReservations = entry.getValue();
            
            int sizeBefore = productReservations.size();
            productReservations.removeIf(r -> {
                if (r.getExpiresAt().isBefore(now)) {
                    log.debug("Reserva expirada removida: productId={}, reservationId={}", 
                        entry.getKey(), r.getReservationId());
                    return true;
                }
                return false;
            });
            
            int removed = sizeBefore - productReservations.size();
            totalRemoved += removed;
            
            // Limpiar la lista si está vacía
            if (productReservations.isEmpty()) {
                reservations.remove(entry.getKey());
            }
        }
        
        if (totalRemoved > 0) {
            log.info("Cleanup completado: {} reservas expiradas removidas", totalRemoved);
        }
    }
    
    /**
     * Clase interna para representar una reserva de stock.
     */
    @Data
    @AllArgsConstructor
    public static class StockReservation {
        private String reservationId;
        private Long productId;
        private Integer quantity;
        private Long userId;        // null para usuarios no autenticados
        private String sessionId;   // para usuarios no autenticados
        private LocalDateTime expiresAt;
    }
}
