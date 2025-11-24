package com.otakushop.controller;

import com.otakushop.dto.CheckoutRequest;
import com.otakushop.entity.Order;
import com.otakushop.service.CheckoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controlador REST para gestión de checkout
 */
@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CheckoutController {

    private final CheckoutService checkoutService;

    /**
     * Valida una solicitud de checkout sin procesarla
     * POST /api/checkout/validate
     */
    @PostMapping("/validate")
    public ResponseEntity<?> validateCheckout(@Valid @RequestBody CheckoutRequest request) {
        try {
            Map<String, Object> validation = checkoutService.validateCheckout(request);
            
            if ((Boolean) validation.get("isValid")) {
                return ResponseEntity.ok(validation);
            } else {
                return ResponseEntity.badRequest().body(validation);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "isValid", false,
                    "errors", java.util.List.of("Error validando checkout: " + e.getMessage())
                ));
        }
    }

    /**
     * Procesa el checkout y crea la orden
     * POST /api/checkout/process
     */
    @PostMapping("/process")
    public ResponseEntity<?> processCheckout(@Valid @RequestBody CheckoutRequest request) {
        try {
            Order order = checkoutService.processCheckout(request);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Orden creada exitosamente",
                "orderId", order.getId(),
                "orderNumber", order.getId().toString(),
                "total", order.getTotal(),
                "status", order.getStatus()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Error procesando checkout: " + e.getMessage()
            ));
        }
    }

    /**
     * Obtiene el resumen de una orden
     * GET /api/checkout/order/{orderId}
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getOrderSummary(@PathVariable Long orderId) {
        // TODO: Implementar obtención de orden
        return ResponseEntity.ok(Map.of(
            "message", "Endpoint pendiente de implementación"
        ));
    }
}
