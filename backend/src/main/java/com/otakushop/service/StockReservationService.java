package com.otakushop.service;

import com.otakushop.entity.StockReservation;
import com.otakushop.entity.Product;
import com.otakushop.repository.StockReservationRepository;
import com.otakushop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio de reserva temporal de stock usando base de datos.
 * 
 * Funcionalidad:
 * - Reserva temporal de stock por 15 minutos cuando se agrega al carrito
 * - Prevención de oversell (vender más de lo disponible)
 * - Liberación automática de reservas expiradas (job schedulado)
 * - Soporta usuarios logeados (user_id) y anónimos (session_id)
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class StockReservationService {
    
    private final StockReservationRepository stockReservationRepository;
    private final ProductRepository productRepository;
    
    /**
     * Reserva stock para un producto.
     * 
     * @param productId ID del producto
     * @param quantity Cantidad a reservar
     * @param userId ID del usuario (puede ser null para anónimos)
     * @param sessionId ID de sesión (puede ser null para logeados)
     * @throws IllegalArgumentException si no hay stock suficiente
     */
    public void reserveStock(Long productId, Integer quantity, Long userId, String sessionId) {
        log.debug("reserveStock() called with: productId={}, quantity={}, userId={}, sessionId={}", 
            productId, quantity, userId, sessionId);
        
        if (productId == null || quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Parámetros inválidos para reserva");
        }
        
        if (userId == null && (sessionId == null || sessionId.isEmpty())) {
            throw new IllegalArgumentException("Se requiere userId o sessionId");
        }
        
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));
        
        // Verificar disponibilidad ANTES de crear reserva
        if (!isStockAvailable(productId, quantity, product.getStock())) {
            Integer available = getAvailableStock(productId, product.getStock());
            throw new IllegalArgumentException(
                String.format("Stock insuficiente. Disponible: %d, Solicitado: %d", 
                    available, quantity)
            );
        }
        
        // Crear y guardar nueva reserva
        @SuppressWarnings("null")
        StockReservation reservation = StockReservation.builder()
            .product(product)
            .sessionId(sessionId)
            .quantity(quantity)
            .build();
        
        @SuppressWarnings("null")
        StockReservation saved = stockReservationRepository.save(reservation);
        
        log.info("Stock reservado: productId={}, quantity={}, userId={}, sessionId={}, expiresAt={}", 
            productId, quantity, userId, sessionId, saved.getExpiresAt());
    }
    
    /**
     * Reduce la reserva de un usuario para un producto
     */
    public void reduceUserReservation(Long productId, Long userId, Integer quantityToRemove) {
        log.debug("reduceUserReservation() called with: productId={}, userId={}, quantityToRemove={}", 
            productId, userId, quantityToRemove);
        
        List<StockReservation> reservations = stockReservationRepository
            .findByProductAndUserAndNotExpired(productId, userId);
        
        for (StockReservation res : reservations) {
            if (res.getQuantity() <= quantityToRemove) {
                // Eliminar reserva completa
                stockReservationRepository.delete(res);
                quantityToRemove -= res.getQuantity();
            } else {
                // Reducir cantidad
                res.setQuantity(res.getQuantity() - quantityToRemove);
                stockReservationRepository.save(res);
                quantityToRemove = 0;
                break;
            }
            
            if (quantityToRemove == 0) break;
        }
        
        log.debug("Reduced reservations for productId={}, userId={}", productId, userId);
    }
    
    /**
     * Verifica si hay stock disponible considerando reservas no expiradas
     * 
     * @param productId ID del producto
     * @param requestedQuantity Cantidad solicitada
     * @param currentStock Stock actual en products.stock
     * @return true si hay stock suficiente
     */
    public boolean isStockAvailable(Long productId, Integer requestedQuantity, Integer currentStock) {
        Integer reservedQuantity = stockReservationRepository
            .sumQuantityByProductAndNotExpired(productId);
        
        reservedQuantity = reservedQuantity == null ? 0 : reservedQuantity;
        Integer available = currentStock - reservedQuantity;
        boolean isAvailable = available >= requestedQuantity;
        
        log.debug("Stock availability check: productId={}, requested={}, currentStock={}, reserved={}, available={}, isAvailable={}", 
            productId, requestedQuantity, currentStock, reservedQuantity, available, isAvailable);
        
        return isAvailable;
    }
    
    /**
     * Obtiene el stock disponible (no reservado)
     * 
     * @param productId ID del producto
     * @param currentStock Stock actual en products.stock
     * @return Cantidad disponible
     */
    public Integer getAvailableStock(Long productId, Integer currentStock) {
        Integer reservedQuantity = stockReservationRepository
            .sumQuantityByProductAndNotExpired(productId);
        
        reservedQuantity = reservedQuantity == null ? 0 : reservedQuantity;
        Integer available = Math.max(0, currentStock - reservedQuantity);
        
        log.debug("getAvailableStock: productId={}, currentStock={}, reserved={}, available={}", 
            productId, currentStock, reservedQuantity, available);
        
        return available;
    }
    
    /**
     * Obtiene todas las reservas de una orden
     */
    public List<StockReservation> getOrderReservations(Long orderId) {
        return stockReservationRepository.findByOrderId(orderId);
    }
}
