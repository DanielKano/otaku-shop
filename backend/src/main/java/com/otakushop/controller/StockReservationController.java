package com.otakushop.controller;

import com.otakushop.service.StockReservationService;
import com.otakushop.util.SecurityUtil;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    private final SecurityUtil securityUtil;
    
    @PostMapping("/reserve")
    public ResponseEntity<?> reserveStock(@Valid @RequestBody ReserveStockRequest request) {
        try {
            // Usar userId del token si está disponible, sino usar el del request
            Long userId = request.getUserId();
            if (userId == null) {
                userId = securityUtil.getCurrentUserId();
            }
            
            // Reservar stock en el backend
            reservationService.reserveStock(
                request.getProductId(),
                request.getQuantity(),
                userId,
                request.getSessionId()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Stock reservado exitosamente");
            response.put("productId", request.getProductId());
            response.put("quantity", request.getQuantity());
            response.put("userId", userId);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Validación fallida");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error al reservar stock");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PostMapping("/available")
    public ResponseEntity<?> checkAvailability(@Valid @RequestBody CheckAvailabilityRequest request) {
        try {
            boolean isAvailable = reservationService.isStockAvailable(
                request.getProductId(),
                request.getQuantity(),
                request.getTotalStock()
            );
            
            Integer availableStock = reservationService.getAvailableStock(
                request.getProductId(),
                request.getTotalStock()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("isAvailable", isAvailable);
            response.put("availableStock", availableStock);
            response.put("requestedQuantity", request.getQuantity());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error al verificar disponibilidad");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
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
