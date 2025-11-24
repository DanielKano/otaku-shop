package com.otakushop.controller;

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

/**
 * Controlador REST para gestión de reservas de stock.
 * 
 * Endpoints:
 * - POST /api/stock-reservations/reserve - Crear reserva
 * - PUT /api/stock-reservations/{id}/update - Actualizar cantidad
 * - PUT /api/stock-reservations/{id}/renew - Renovar tiempo
 * - DELETE /api/stock-reservations/{id} - Liberar reserva
 * - GET /api/stock-reservations/available/{productId} - Consultar disponibilidad
 * - GET /api/stock-reservations/user/{userId} - Reservas de usuario
 * - GET /api/stock-reservations/session/{sessionId} - Reservas de sesión
 */
@RestController
@RequestMapping("/api/stock-reservations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StockReservationController {
    
    private final StockReservationService reservationService;
    
    /**
     * Crea una nueva reserva de stock.
     */
    @PostMapping("/reserve")
    public ResponseEntity<?> reserveStock(@Valid @RequestBody ReserveStockRequest request) {
        try {
            String reservationId = reservationService.reserveStock(
                request.getProductId(),
                request.getQuantity(),
                request.getUserId(),
                request.getSessionId()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("reservationId", reservationId);
            response.put("message", "Stock reservado exitosamente");
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Actualiza la cantidad de una reserva existente.
     */
    @PutMapping("/{reservationId}/update")
    public ResponseEntity<?> updateReservation(
            @PathVariable String reservationId,
            @Valid @RequestBody UpdateQuantityRequest request) {
        
        boolean updated = reservationService.updateReservation(reservationId, request.getQuantity());
        
        Map<String, Object> response = new HashMap<>();
        if (updated) {
            response.put("success", true);
            response.put("message", "Reserva actualizada exitosamente");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Reserva no encontrada o expirada");
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Renueva el tiempo de expiración de una reserva.
     */
    @PutMapping("/{reservationId}/renew")
    public ResponseEntity<?> renewReservation(@PathVariable String reservationId) {
        boolean renewed = reservationService.renewReservation(reservationId);
        
        Map<String, Object> response = new HashMap<>();
        if (renewed) {
            response.put("success", true);
            response.put("message", "Reserva renovada exitosamente");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Reserva no encontrada");
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Libera una reserva de stock.
     */
    @DeleteMapping("/{reservationId}")
    public ResponseEntity<?> releaseReservation(@PathVariable String reservationId) {
        boolean released = reservationService.releaseReservation(reservationId);
        
        Map<String, Object> response = new HashMap<>();
        if (released) {
            response.put("success", true);
            response.put("message", "Reserva liberada exitosamente");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Reserva no encontrada");
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Consulta la disponibilidad de stock para un producto.
     */
    @PostMapping("/available")
    public ResponseEntity<?> checkAvailability(@Valid @RequestBody CheckAvailabilityRequest request) {
        Integer reserved = reservationService.getReservedQuantity(request.getProductId());
        Integer available = reservationService.getAvailableStock(
            request.getProductId(), 
            request.getTotalStock()
        );
        boolean isAvailable = reservationService.isStockAvailable(
            request.getProductId(),
            request.getQuantity(),
            request.getTotalStock()
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("productId", request.getProductId());
        response.put("totalStock", request.getTotalStock());
        response.put("reservedQuantity", reserved);
        response.put("availableStock", available);
        response.put("requestedQuantity", request.getQuantity());
        response.put("isAvailable", isAvailable);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Obtiene todas las reservas activas de un usuario.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserReservations(@PathVariable Long userId) {
        List<StockReservationService.StockReservation> reservations = 
            reservationService.getUserReservations(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("reservations", reservations);
        response.put("count", reservations.size());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Obtiene todas las reservas activas de una sesión.
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<?> getSessionReservations(@PathVariable String sessionId) {
        List<StockReservationService.StockReservation> reservations = 
            reservationService.getSessionReservations(sessionId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", sessionId);
        response.put("reservations", reservations);
        response.put("count", reservations.size());
        
        return ResponseEntity.ok(response);
    }
    
    // DTOs para requests
    
    @Data
    public static class ReserveStockRequest {
        @NotNull(message = "El ID del producto es requerido")
        private Long productId;
        
        @NotNull(message = "La cantidad es requerida")
        @Min(value = 1, message = "La cantidad debe ser al menos 1")
        private Integer quantity;
        
        private Long userId;        // Opcional para usuarios autenticados
        private String sessionId;   // Opcional para usuarios no autenticados
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
}
