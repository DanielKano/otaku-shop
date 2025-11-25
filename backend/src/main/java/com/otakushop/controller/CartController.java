package com.otakushop.controller;

import com.otakushop.dto.CartItemDTO;
import com.otakushop.dto.CartItemRequest;
import com.otakushop.dto.CartItemUpdateRequest;
import com.otakushop.service.CartService;
import com.otakushop.service.StockReservationService;
import com.otakushop.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
@Slf4j
public class CartController {
    
    private final CartService cartService;
    private final StockReservationService stockReservationService;
    private final SecurityUtil securityUtil;
    
    /**
     * GET /api/cart - Obtiene todos los items del carrito del usuario autenticado
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getCart() {
        try {
            Long userId = securityUtil.getCurrentUserId();
            List<CartItemDTO> items = cartService.getCartItems(userId);
            BigDecimal total = cartService.getCartTotal(userId);
            Long itemCount = cartService.getCartItemCount(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("items", items);
            response.put("total", total);
            response.put("itemCount", itemCount);
            response.put("message", "Carrito obtenido exitosamente");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting cart", e);
            throw e;
        }
    }
    
    /**
     * POST /api/cart/add - Agrega un producto al carrito
     */
    @PostMapping("/add")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> addToCart(
            @Valid @RequestBody CartItemRequest request) {
        try {
            log.debug("Adding to cart: productId={}, quantity={}", request.getProductId(), request.getQuantity());
            
            Long userId = securityUtil.getCurrentUserId();
            CartItemDTO cartItem = cartService.addItem(userId, request);
            BigDecimal total = cartService.getCartTotal(userId);
            Long itemCount = cartService.getCartItemCount(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("cartItem", cartItem);
            response.put("total", total);
            response.put("itemCount", itemCount);
            response.put("message", "Producto agregado al carrito exitosamente");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.warn("Bad request in addToCart: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error adding to cart", e);
            throw e;
        }
    }
    
    /**
     * PUT /api/cart/{id} - Actualiza la cantidad de un item en el carrito
     */
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> updateCartItem(
            @PathVariable Long id,
            @Valid @RequestBody CartItemUpdateRequest request) {
        try {
            Long userId = securityUtil.getCurrentUserId();
            CartItemDTO cartItem = cartService.updateItem(userId, id, request.getQuantity());
            BigDecimal total = cartService.getCartTotal(userId);
            Long itemCount = cartService.getCartItemCount(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("cartItem", cartItem);
            response.put("total", total);
            response.put("itemCount", itemCount);
            response.put("message", "Cantidad actualizada exitosamente");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating cart item", e);
            throw e;
        }
    }
    
    /**
     * DELETE /api/cart/{id} - Elimina un item del carrito
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> removeFromCart(@PathVariable Long id) {
        try {
            Long userId = securityUtil.getCurrentUserId();
            cartService.removeItem(userId, id);
            
            BigDecimal total = cartService.getCartTotal(userId);
            Long itemCount = cartService.getCartItemCount(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("total", total);
            response.put("itemCount", itemCount);
            response.put("message", "Item eliminado del carrito exitosamente");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error removing from cart", e);
            throw e;
        }
    }
    
    /**
     * GET /api/cart/reservations - COMENTADO: Método legacy que usa getUserReservations() que no existe en la nueva implementación
     * La Fase 3 de arquitectura refactorizó StockReservationService y este método debe ser reescrito
     */
    /*
    @GetMapping("/reservations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getReservations() {
        try {
            Long userId = securityUtil.getCurrentUserId();
            var reservations = stockReservationService.getUserReservations(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("reservations", reservations);
            response.put("count", reservations != null ? reservations.size() : 0);
            response.put("message", "Reservas de stock obtenidas exitosamente");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting reservations", e);
            throw e;
        }
    }
    */
    
    /**
     * DELETE /api/cart - Limpia todo el carrito del usuario
     */
    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> clearCart() {
        try {
            Long userId = securityUtil.getCurrentUserId();
            cartService.clearCart(userId);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Carrito limpiado exitosamente");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error clearing cart", e);
            throw e;
        }
    }
}
