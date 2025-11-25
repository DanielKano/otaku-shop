package com.otakushop.service;

import com.otakushop.dto.CartItemDTO;
import com.otakushop.dto.CartItemRequest;
import com.otakushop.entity.CartItem;
import com.otakushop.entity.Product;
import com.otakushop.entity.User;
import com.otakushop.exception.ResourceNotFoundException;
import com.otakushop.repository.CartItemRepository;
import com.otakushop.repository.ProductRepository;
import com.otakushop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CartService {
    
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final StockReservationService stockReservationService;
    
    // Máximo de unidades que un usuario puede reservar
    private static final int MAX_UNITS_PER_USER = 10;
    
    /**
     * Obtiene todos los items del carrito del usuario
     */
    public List<CartItemDTO> getCartItems(Long userId) {
        return cartItemRepository.findByUserId(userId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtiene el total del carrito
     */
    public BigDecimal getCartTotal(Long userId) {
        return cartItemRepository.findByUserId(userId)
            .stream()
            .map(item -> item.getProduct().getPrice()
                .multiply(new BigDecimal(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    /**
     * Obtiene la cantidad de items en el carrito
     */
    public Long getCartItemCount(Long userId) {
        return cartItemRepository.countByUserId(userId);
    }
    
    /**
     * Agrega un producto al carrito con validaciones de stock y límite de 10 unidades
     */
    public CartItemDTO addItem(Long userId, CartItemRequest request) {
        try {
            log.debug("addItem() called with userId={}, productId={}, quantity={}", userId, request.getProductId(), request.getQuantity());
            
            @SuppressWarnings("null")
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
            log.debug("User found: {}", user.getId());
            
            @SuppressWarnings("null")
            Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
            log.debug("Product found: id={}, stock={}", product.getId(), product.getStock());
            
            // Validaciones básicas
            if (request.getQuantity() <= 0) {
                log.error("Invalid quantity: {}", request.getQuantity());
                throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
            }
            
            // Obtener cantidad actual del usuario en carrito
            CartItem existingCartItem = cartItemRepository
                .findByUserIdAndProductId(userId, request.getProductId())
                .orElse(null);
            
            int currentQuantity = existingCartItem != null ? existingCartItem.getQuantity() : 0;
            int newTotalQuantity = currentQuantity + request.getQuantity();
            log.debug("Current quantity: {}, New total: {}", currentQuantity, newTotalQuantity);
            
            // ✅ VALIDACIÓN 1: Máximo 10 unidades por usuario
            if (newTotalQuantity > MAX_UNITS_PER_USER) {
                log.error("Exceeds maximum units: {} > {}", newTotalQuantity, MAX_UNITS_PER_USER);
                throw new IllegalArgumentException(
                    String.format("Solo puedes reservar hasta %d unidades. Ya tienes %d, intentas agregar %d",
                        MAX_UNITS_PER_USER, currentQuantity, request.getQuantity())
                );
            }
            
            // ✅ VALIDACIÓN 2: Validar stock disponible (considerando otras reservas)
            log.debug("Checking stock availability: productId={}, quantity={}, stock={}", 
                request.getProductId(), request.getQuantity(), product.getStock());
                
            if (!stockReservationService.isStockAvailable(request.getProductId(), request.getQuantity(), product.getStock())) {
                Integer available = stockReservationService.getAvailableStock(request.getProductId(), product.getStock());
                log.error("Stock insufficient: available={}, requested={}", available, request.getQuantity());
                throw new IllegalArgumentException(
                    String.format("Stock insuficiente. Disponible: %d, Solicitado: %d",
                        available, request.getQuantity())
                );
            }
            
            if (existingCartItem != null) {
                log.debug("Updating existing cart item: id={}, newQuantity={}", existingCartItem.getId(), newTotalQuantity);
                existingCartItem.setQuantity(newTotalQuantity);
                
                // ✅ Crear/actualizar reserva de stock
                log.debug("Reserving stock for existing item");
                stockReservationService.reserveStock(
                    request.getProductId(),
                    newTotalQuantity,
                    userId,
                    null
                );
                
                CartItem updated = cartItemRepository.save(existingCartItem);
                log.info("Cart item updated successfully: cartItemId={}", updated.getId());
                return convertToDTO(updated);
            }
            
            // Crear nuevo item
            log.debug("Creating new cart item for productId={}", request.getProductId());
            CartItem cartItem = CartItem.builder()
                .user(user)
                .product(product)
                .quantity(request.getQuantity())
                .build();
            
            // ✅ Crear reserva de stock
            log.debug("Reserving stock for new item");
            stockReservationService.reserveStock(
                request.getProductId(),
                request.getQuantity(),
                userId,
                null
            );
            
            @SuppressWarnings("null")
            CartItem saved = cartItemRepository.save(cartItem);
            log.info("New cart item created successfully: cartItemId={}", saved.getId());
            return convertToDTO(saved);
        } catch (ResourceNotFoundException | IllegalArgumentException e) {
            log.warn("Expected error in addItem: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error in addItem for userId={}, productId={}", userId, request.getProductId(), e);
            throw e;
        }
    }
    
    /**
     * Actualiza la cantidad de un item en el carrito con validaciones de reserva
     */
    public CartItemDTO updateItem(Long userId, Long cartItemId, Integer quantity) {
        @SuppressWarnings("null")
        CartItem cartItem = cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new ResourceNotFoundException("Item del carrito no encontrado"));
        
        // Validar que el item pertenece al usuario
        if (!cartItem.getUser().getId().equals(userId)) {
            throw new SecurityException("No autorizado para modificar este item");
        }
        
        // Validaciones básicas
        if (quantity <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
        }
        
        int oldQuantity = cartItem.getQuantity();
        long productId = cartItem.getProduct().getId();
        int stockAvailable = cartItem.getProduct().getStock();
        
        // ✅ VALIDACIÓN 1: Máximo 10 unidades por usuario
        if (quantity > MAX_UNITS_PER_USER) {
            throw new IllegalArgumentException(
                String.format("Solo puedes reservar hasta %d unidades por producto. Intentas: %d",
                    MAX_UNITS_PER_USER, quantity)
            );
        }
        
        // ✅ VALIDACIÓN 2: Si aumentamos cantidad, validar stock y reservas
        if (quantity > oldQuantity) {
            int quantityIncrease = quantity - oldQuantity;
            
            if (!stockReservationService.isStockAvailable(productId, quantityIncrease, stockAvailable)) {
                Integer available = stockReservationService.getAvailableStock(productId, stockAvailable);
                throw new IllegalArgumentException(
                    String.format("Stock insuficiente para aumentar. Disponible: %d, Necesitas: %d más",
                        available, quantityIncrease)
                );
            }
            
            // ✅ Actualizar reserva a nueva cantidad
            stockReservationService.reserveStock(
                productId,
                quantity,
                userId,
                null
            );
        } else if (quantity < oldQuantity) {
            // ✅ Si disminuimos, reducir la reserva
            int quantityToReduce = oldQuantity - quantity;
            stockReservationService.reduceUserReservation(productId, userId, quantityToReduce);
        }
        
        cartItem.setQuantity(quantity);
        CartItem updated = cartItemRepository.save(cartItem);
        return convertToDTO(updated);
    }
    
    /**
     * Elimina un item del carrito y libera su reserva de stock
     */
    public void removeItem(Long userId, Long cartItemId) {
        @SuppressWarnings("null")
        CartItem cartItem = cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new ResourceNotFoundException("Item del carrito no encontrado"));
        
        // Validar que el item pertenece al usuario
        if (!cartItem.getUser().getId().equals(userId)) {
            throw new SecurityException("No autorizado para eliminar este item");
        }
        
        // ✅ Liberar la reserva de stock
        stockReservationService.reduceUserReservation(
            cartItem.getProduct().getId(),
            userId,
            cartItem.getQuantity()
        );
        
        cartItemRepository.deleteById(Objects.requireNonNull(cartItemId, "cartItemId cannot be null"));
    }
    
    /**
     * Limpia todo el carrito del usuario y libera todas sus reservas de stock
     */
    public void clearCart(Long userId) {
        // Obtener todos los items del usuario para liberar sus reservas
        List<CartItem> userItems = cartItemRepository.findByUserId(userId);
        
        for (CartItem item : userItems) {
            // ✅ Liberar cada reserva de stock
            stockReservationService.reduceUserReservation(
                item.getProduct().getId(),
                userId,
                item.getQuantity()
            );
        }
        
        cartItemRepository.deleteByUserId(userId);
    }
    
    /**
     * ✅ NUEVO: Merge carrito anónimo al carrito del usuario al hacer login
     * Si el usuario ya tiene items, suma las cantidades
     */
    @Transactional
    public void mergeAnonCartToUser(String sessionId, User user) {
        if (sessionId == null || sessionId.isEmpty()) {
            log.debug("No session cart to merge");
            return;
        }
        
        log.info("Merging anonymous cart (sessionId={}) to user (userId={})", sessionId, user.getId());
        
        // Buscar items en carrito anónimo
        List<CartItem> anonItems = cartItemRepository
            .findBySessionIdAndUserIsNull(sessionId);
        
        if (anonItems.isEmpty()) {
            log.debug("No anonymous cart items found for sessionId={}", sessionId);
            return;
        }
        
        for (CartItem anonItem : anonItems) {
            Product product = anonItem.getProduct();
            
            // Buscar si el usuario ya tiene este producto
            var existingItem = cartItemRepository
                .findByUserAndProduct(user, product);
            
            if (existingItem.isPresent()) {
                // ✅ Sumar cantidades
                CartItem userItem = existingItem.get();
                int totalQuantity = userItem.getQuantity() + anonItem.getQuantity();
                
                // Validar límite de 10 unidades
                if (totalQuantity > MAX_UNITS_PER_USER) {
                    log.warn("Merge would exceed MAX_UNITS_PER_USER for productId={}, user={}. " +
                            "Existing: {}, Anonymous: {}, Would be: {}", 
                            product.getId(), user.getId(),
                            userItem.getQuantity(), anonItem.getQuantity(), totalQuantity);
                    totalQuantity = MAX_UNITS_PER_USER;  // Capear al máximo
                }
                
                userItem.setQuantity(totalQuantity);
                cartItemRepository.save(userItem);
                
                log.debug("Merged anonymous item to existing cart item: productId={}, newQuantity={}", 
                    product.getId(), totalQuantity);
                
                // Actualizar reserva de stock con nueva cantidad
                stockReservationService.reserveStock(
                    product.getId(),
                    totalQuantity,
                    user.getId(),
                    null
                );
                
            } else {
                // ✅ Asignar item anónimo al usuario
                anonItem.setUser(user);
                anonItem.setSessionId(null);
                cartItemRepository.save(anonItem);
                
                log.debug("Assigned anonymous cart item to user: productId={}, quantity={}", 
                    product.getId(), anonItem.getQuantity());
                
                // Reservar stock con nuevo usuario
                stockReservationService.reserveStock(
                    product.getId(),
                    anonItem.getQuantity(),
                    user.getId(),
                    null
                );
            }
            
            // Eliminar item anónimo (ahora asignado o mergeado)
            cartItemRepository.delete(anonItem);
        }
        
        // Limpiar sesión anónima de base de datos
        cartItemRepository.deleteBySessionId(sessionId);
        
        log.info("Merge completed for sessionId={} and userId={}", sessionId, user.getId());
    }
    
    
    /**
     * Convierte CartItem a CartItemDTO
     */
    private CartItemDTO convertToDTO(CartItem cartItem) {
        BigDecimal subtotal = cartItem.getProduct().getPrice()
            .multiply(new BigDecimal(cartItem.getQuantity()));
        
        return CartItemDTO.builder()
            .id(cartItem.getId())
            .productId(cartItem.getProduct().getId())
            .productName(cartItem.getProduct().getName())
            .productImage(cartItem.getProduct().getImageUrl())
            .productPrice(cartItem.getProduct().getPrice())
            .quantity(cartItem.getQuantity())
            .subtotal(subtotal)
            .createdAt(cartItem.getCreatedAt())
            .updatedAt(cartItem.getUpdatedAt())
            .build();
    }
}
