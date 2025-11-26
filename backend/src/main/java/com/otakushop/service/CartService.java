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
            
            // ✅ VALIDACIÓN 2: Validar que hay STOCK DISPONIBLE
            log.debug("Checking stock availability: productId={}, quantity={}, currentStock={}", 
                request.getProductId(), request.getQuantity(), product.getStock());
            
            if (product.getStock() < request.getQuantity()) {
                log.error("Stock insufficient: available={}, requested={}", product.getStock(), request.getQuantity());
                throw new IllegalArgumentException(
                    String.format("Stock insuficiente. Disponible: %d, Solicitado: %d",
                        product.getStock(), request.getQuantity())
                );
            }
            
            if (existingCartItem != null) {
                // El usuario ya tiene este producto en el carrito
                log.debug("Updating existing cart item: id={}, oldQuantity={}, newQuantity={}", 
                    existingCartItem.getId(), currentQuantity, newTotalQuantity);
                
                // Solo necesitamos decrementar la DIFERENCIA de stock
                int quantityIncrease = request.getQuantity();
                
                // ✅ DECREMENTAR STOCK EN BD
                product.setStock(product.getStock() - quantityIncrease);
                productRepository.save(product);
                log.info("Stock decremented: productId={}, quantityDecrease={}, newStock={}", 
                    product.getId(), quantityIncrease, product.getStock());
                
                // Actualizar cantidad en carrito
                existingCartItem.setQuantity(newTotalQuantity);
                CartItem updated = cartItemRepository.save(existingCartItem);
                log.info("Cart item updated successfully: cartItemId={}, newQuantity={}", updated.getId(), newTotalQuantity);
                return convertToDTO(updated);
            }
            
            // Crear nuevo item en carrito
            log.debug("Creating new cart item for productId={}, quantity={}", request.getProductId(), request.getQuantity());
            
            // ✅ DECREMENTAR STOCK EN BD
            product.setStock(product.getStock() - request.getQuantity());
            productRepository.save(product);
            log.info("Stock decremented: productId={}, quantityDecrease={}, newStock={}", 
                product.getId(), request.getQuantity(), product.getStock());
            
            // Crear CartItem
            CartItem cartItem = CartItem.builder()
                .user(user)
                .product(product)
                .quantity(request.getQuantity())
                .build();
            
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
     * ✅ NUEVO: Actualiza cantidad en carrito AJUSTANDO el stock en BD
     * 
     * Si aumenta: DECREMENTA stock adicional
     * Si disminuye: INCREMENTA stock de vuelta
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
        Product product = cartItem.getProduct();
        long productId = product.getId();
        
        log.debug("updateItem() called: cartItemId={}, oldQuantity={}, newQuantity={}", cartItemId, oldQuantity, quantity);
        
        // ✅ VALIDACIÓN 1: Máximo 10 unidades por usuario
        if (quantity > MAX_UNITS_PER_USER) {
            throw new IllegalArgumentException(
                String.format("Solo puedes comprar hasta %d unidades por producto. Intentas: %d",
                    MAX_UNITS_PER_USER, quantity)
            );
        }
        
        // ✅ Si aumenta la cantidad
        if (quantity > oldQuantity) {
            int quantityIncrease = quantity - oldQuantity;
            
            // Validar que hay suficiente stock disponible
            if (product.getStock() < quantityIncrease) {
                throw new IllegalArgumentException(
                    String.format("Stock insuficiente para aumentar. Disponible: %d, Necesitas: %d más",
                        product.getStock(), quantityIncrease)
                );
            }
            
            // ✅ DECREMENTAR el stock adicional en BD
            product.setStock(product.getStock() - quantityIncrease);
            productRepository.save(product);
            log.info("Stock decremented for increase: productId={}, decrease={}, newStock={}", 
                productId, quantityIncrease, product.getStock());
        } 
        // ✅ Si disminuye la cantidad
        else if (quantity < oldQuantity) {
            int quantityToRestore = oldQuantity - quantity;
            
            // ✅ INCREMENTAR stock de vuelta en BD
            product.setStock(product.getStock() + quantityToRestore);
            productRepository.save(product);
            log.info("Stock incremented for decrease: productId={}, increase={}, newStock={}", 
                productId, quantityToRestore, product.getStock());
        }
        // Si es igual, no hacer nada
        
        cartItem.setQuantity(quantity);
        CartItem updated = cartItemRepository.save(cartItem);
        log.info("Cart item updated successfully: cartItemId={}, newQuantity={}", cartItemId, quantity);
        return convertToDTO(updated);
    }
    
    /**
     * ✅ NUEVO: Elimina item del carrito RESTAURANDO su stock en BD
     */
    public void removeItem(Long userId, Long cartItemId) {
        @SuppressWarnings("null")
        CartItem cartItem = cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new ResourceNotFoundException("Item del carrito no encontrado"));
        
        // Validar que el item pertenece al usuario
        if (!cartItem.getUser().getId().equals(userId)) {
            throw new SecurityException("No autorizado para eliminar este item");
        }
        
        Product product = cartItem.getProduct();
        int quantityToRestore = cartItem.getQuantity();
        
        log.debug("removeItem() called: cartItemId={}, quantity={}, productId={}", 
            cartItemId, quantityToRestore, product.getId());
        
        // ✅ INCREMENTAR stock de vuelta en BD
        product.setStock(product.getStock() + quantityToRestore);
        productRepository.save(product);
        log.info("Stock restored: productId={}, quantityRestored={}, newStock={}", 
            product.getId(), quantityToRestore, product.getStock());
        
        // Eliminar CartItem
        cartItemRepository.deleteById(Objects.requireNonNull(cartItemId, "cartItemId cannot be null"));
        log.info("Cart item removed: cartItemId={}", cartItemId);
    }
    
    /**
     * ✅ NUEVO: Limpia todo el carrito del usuario RESTAURANDO stock en BD
     */
    public void clearCart(Long userId) {
        // Obtener todos los items del usuario para restaurar su stock
        List<CartItem> userItems = cartItemRepository.findByUserId(userId);
        
        log.debug("clearCart() called for userId={}, itemCount={}", userId, userItems.size());
        
        for (CartItem item : userItems) {
            Product product = item.getProduct();
            int quantityToRestore = item.getQuantity();
            
            // ✅ INCREMENTAR stock de vuelta en BD
            product.setStock(product.getStock() + quantityToRestore);
            productRepository.save(product);
            log.info("Stock restored on clear: productId={}, quantityRestored={}, newStock={}", 
                product.getId(), quantityToRestore, product.getStock());
        }
        
        cartItemRepository.deleteByUserId(userId);
        log.info("Cart cleared for userId={}, restored {} items", userId, userItems.size());
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
            .productStock(cartItem.getProduct().getStock())
            .quantity(cartItem.getQuantity())
            .subtotal(subtotal)
            .createdAt(cartItem.getCreatedAt())
            .updatedAt(cartItem.getUpdatedAt())
            .build();
    }
}
