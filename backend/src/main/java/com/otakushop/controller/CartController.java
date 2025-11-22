package com.otakushop.controller;

import com.otakushop.dto.CartItemDTO;
import com.otakushop.dto.CartItemRequest;
import com.otakushop.dto.CartItemUpdateRequest;
import com.otakushop.service.CartService;
import com.otakushop.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {
    
    private final CartService cartService;
    private final SecurityUtil securityUtil;
    
    /**
     * GET /api/cart - Obtiene todos los items del carrito del usuario autenticado
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getCart() {
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
    }
    
    /**
     * POST /api/cart/add - Agrega un producto al carrito
     */
    @PostMapping("/add")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> addToCart(
            @Valid @RequestBody CartItemRequest request) {
        
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
    }
    
    /**
     * PUT /api/cart/{id} - Actualiza la cantidad de un item en el carrito
     */
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> updateCartItem(
            @PathVariable Long id,
            @Valid @RequestBody CartItemUpdateRequest request) {
        
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
    }
    
    /**
     * DELETE /api/cart/{id} - Elimina un item del carrito
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> removeFromCart(@PathVariable Long id) {
        Long userId = securityUtil.getCurrentUserId();
        cartService.removeItem(userId, id);
        
        BigDecimal total = cartService.getCartTotal(userId);
        Long itemCount = cartService.getCartItemCount(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("total", total);
        response.put("itemCount", itemCount);
        response.put("message", "Item eliminado del carrito exitosamente");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * DELETE /api/cart - Limpia todo el carrito del usuario
     */
    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> clearCart() {
        Long userId = securityUtil.getCurrentUserId();
        cartService.clearCart(userId);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Carrito limpiado exitosamente");
        
        return ResponseEntity.ok(response);
    }
}
