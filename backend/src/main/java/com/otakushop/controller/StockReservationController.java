package com.otakushop.controller;

/**
 * ⚠️ CONTROLADOR COMENTADO - LEGACY
 * 
 * Este controlador ha sido deshabilitado porque usa métodos que no existen
 * en la nueva implementación de StockReservationService (Fase 3 de arquitectura).
 * 
 * La Fase 3 refactorizó completamente el servicio para usar:
 * - reserveStock(Long productId, Integer quantity, Long userId, String sessionId)
 * - reduceUserReservation(Long productId, Long userId, Integer quantityToRemove)
 * - isStockAvailable(Long productId, Integer requestedQuantity, Integer currentStock)
 * - getAvailableStock(Long productId, Integer currentStock)
 * - getOrderReservations(Long orderId)
 * 
 * Para usar reservas de stock, debes refactorizar este controlador.
 */

/*
import com.otakushop.service.StockReservationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@RestController
@RequestMapping("/stock-reservations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StockReservationController {
    
    private final StockReservationService reservationService;
    
    @PostMapping("/reserve")
    public ResponseEntity<?> reserveStock(@Valid @RequestBody ReserveStockRequest request) {
        // IMPLEMENTACIÓN LEGACY - NO DISPONIBLE
    }
    
    @PutMapping("/{reservationId}/update")
    public ResponseEntity<?> updateReservation(
            @PathVariable String reservationId,
            @Valid @RequestBody UpdateQuantityRequest request) {
        // IMPLEMENTACIÓN LEGACY - NO DISPONIBLE
    }
    
    @PutMapping("/{reservationId}/renew")
    public ResponseEntity<?> renewReservation(@PathVariable String reservationId) {
        // IMPLEMENTACIÓN LEGACY - NO DISPONIBLE
    }
    
    @DeleteMapping("/{reservationId}")
    public ResponseEntity<?> releaseReservation(@PathVariable String reservationId) {
        // IMPLEMENTACIÓN LEGACY - NO DISPONIBLE
    }
    
    @PostMapping("/available")
    public ResponseEntity<?> checkAvailability(@Valid @RequestBody CheckAvailabilityRequest request) {
        // IMPLEMENTACIÓN LEGACY - NO DISPONIBLE
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserReservations(@PathVariable Long userId) {
        // IMPLEMENTACIÓN LEGACY - NO DISPONIBLE
    }
    
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<?> getSessionReservations(@PathVariable String sessionId) {
        // IMPLEMENTACIÓN LEGACY - NO DISPONIBLE
    }

    @GetMapping("/my-reservations")
    public ResponseEntity<?> getMyReservations(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        // IMPLEMENTACIÓN LEGACY - NO DISPONIBLE
    }

    @PostMapping("/sync")
    public ResponseEntity<?> syncReservations(
            @Valid @RequestBody SyncReservationsRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        // IMPLEMENTACIÓN LEGACY - NO DISPONIBLE
    }

    @Data
    public static class ReserveStockRequest {
        @NotNull(message = "El ID del producto es requerido")
        private Long productId;
        
        @NotNull(message = "La cantidad es requerida")
        @Min(value = 1, message = "La cantidad debe ser al menos 1")
        private Integer quantity;
        
        private Long userId;
        private String sessionId;
    }
    
    @Data
    public static class UpdateQuantityRequest {
        @NotNull(message = "La cantidad es requerida")
        @Min(value = 1, message = "La cantidad debe ser al menos 1")
        private Integer quantity;
    }
    
    @Data
    public static class CheckAvailabilityRequest {
        @NotNull(message = "El ID del producto es requerido")
        private Long productId;
        
        @NotNull(message = "El stock total es requerido")
        @Min(value = 0, message = "El stock no puede ser negativo")
        private Integer totalStock;
        
        @NotNull(message = "La cantidad es requerida")
        @Min(value = 1, message = "La cantidad debe ser al menos 1")
        private Integer quantity;
    }

    @Data
    public static class SyncReservationsRequest {
        private Map<String, Object> reservations;
    }
}
*/
