package com.otakushop.controller;

import com.otakushop.dto.CreateOrderRequest;
import com.otakushop.dto.OrderDTO;
import com.otakushop.entity.OrderStatus;
import com.otakushop.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class OrderController {
    
    private final OrderService orderService;
    
    /**
     * GET /orders - Obtiene las órdenes del usuario autenticado
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getOrders() {
        try {
            List<OrderDTO> orders = orderService.getOrdersByCurrentUser();
            Map<String, Object> response = new HashMap<>();
            response.put("count", orders.size());
            response.put("message", "Órdenes obtenidas exitosamente");
            response.put("orders", orders);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error al obtener órdenes", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener órdenes",
                            "message", e.getMessage()));
        }
    }
    
    /**
     * GET /orders/{id} - Obtiene una orden específica
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        try {
            OrderDTO order = orderService.getOrderById(id);
            return ResponseEntity.ok(Map.of(
                    "order", order,
                    "message", "Orden obtenida exitosamente"
            ));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Acceso denegado", "message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "No encontrada", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al obtener orden", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener orden", "message", e.getMessage()));
        }
    }
    
    /**
     * POST /orders - Crea una nueva orden
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        try {
            OrderDTO createdOrder = orderService.createOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "order", createdOrder,
                    "message", "Orden creada exitosamente"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Solicitud inválida", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al crear orden", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al crear orden", "message", e.getMessage()));
        }
    }
    
    /**
     * PUT /orders/{id}/cancel - Cancela una orden
     */
    @PutMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        try {
            OrderDTO cancelledOrder = orderService.cancelOrder(id);
            return ResponseEntity.ok(Map.of(
                    "order", cancelledOrder,
                    "message", "Orden cancelada exitosamente"
            ));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Acceso denegado", "message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "No se puede cancelar", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al cancelar orden", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al cancelar orden", "message", e.getMessage()));
        }
    }
    
    /**
     * PUT /orders/{id}/status - Actualiza el estado de una orden (ADMIN)
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        try {
            OrderDTO updatedOrder = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(Map.of(
                    "order", updatedOrder,
                    "message", "Estado actualizado exitosamente"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Solicitud inválida", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al actualizar estado de orden", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al actualizar estado", "message", e.getMessage()));
        }
    }
}
