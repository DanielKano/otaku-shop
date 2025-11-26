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
import org.springframework.transaction.annotation.Isolation;
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
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public CartItemDTO addItem(Long userId, CartItemRequest request) {
        try {
            log.info("🔴 addItem() STARTED - userId={}, productId={}, requestQuantity={}", userId, request.getProductId(), request.getQuantity());

            // Log para verificar el estado inicial de la transacción
            log.debug("🔵 Transaction started for addItem");

            @SuppressWarnings("null")
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
            log.debug("User found: {}", user.getId());

            Product lockedProduct = productRepository.findByIdForUpdate(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
            log.info("🔴 Product locked for update: id={}, CURRENT STOCK BEFORE={}", lockedProduct.getId(), lockedProduct.getStock());

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

            // Validaciones de stock
            if (lockedProduct.getStock() < request.getQuantity()) {
                log.error("Stock insufficient: available={}, requested={}", lockedProduct.getStock(), request.getQuantity());
                throw new IllegalArgumentException(
                    String.format("Stock insuficiente. Disponible: %d, Solicitado: %d",
                        lockedProduct.getStock(), request.getQuantity())
                );
            }

            // Actualizar stock y carrito
            lockedProduct.setStock(lockedProduct.getStock() - request.getQuantity());
            productRepository.save(lockedProduct);
            log.info("🔴 Stock updated: newStock={}", lockedProduct.getStock());

            if (existingCartItem != null) {
                existingCartItem.setQuantity(newTotalQuantity);
                CartItem updated = cartItemRepository.save(existingCartItem);
                log.info("🔴 Cart item updated: id={}, quantity={}", updated.getId(), updated.getQuantity());
                return convertToDTO(updated);
            }

            CartItem newCartItem = CartItem.builder()
                .user(user)
                .product(lockedProduct)
                .quantity(request.getQuantity())
                .build();
            CartItem savedCartItem = cartItemRepository.save(newCartItem);
            log.info("🔴 New cart item created: id={}, quantity={}", savedCartItem.getId(), savedCartItem.getQuantity());

            return convertToDTO(savedCartItem);
        } catch (Exception e) {
            log.error("🔴 Error in addItem: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * ✅ NUEVO: Actualiza cantidad en carrito AJUSTANDO el stock en BD
     * 
     * Si aumenta: DECREMENTA stock adicional
     * Si disminuye: INCREMENTA stock de vuelta
     * 
     * Usa findByIdForUpdate() para bloqueo pesimista, evitando race conditions
     */
    public CartItemDTO updateItem(Long userId, Long cartItemId, Integer quantity) {
        log.info("🔵 updateItem() STARTED - userId={}, cartItemId={}, newQuantity={}", userId, cartItemId, quantity);
        
        @SuppressWarnings("null")
        CartItem cartItem = cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new ResourceNotFoundException("Item del carrito no encontrado"));
        
        log.debug("🔵 CartItem found: id={}, currentQuantity={}, productId={}", cartItemId, cartItem.getQuantity(), cartItem.getProduct().getId());
        
        // Validar que el item pertenece al usuario
        if (!cartItem.getUser().getId().equals(userId)) {
            log.error("❌ UNAUTHORIZED - Item {} does not belong to userId {}", cartItemId, userId);
            throw new SecurityException("No autorizado para modificar este item");
        }
        
        // Validaciones básicas
        if (quantity <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
        }
        
        int oldQuantity = cartItem.getQuantity();
        long productId = cartItem.getProduct().getId();
        
        log.debug("updateItem() called: cartItemId={}, oldQuantity={}, newQuantity={}", cartItemId, oldQuantity, quantity);
        
        // ✅ VALIDACIÓN 1: Máximo 10 unidades por usuario
        if (quantity > MAX_UNITS_PER_USER) {
            // Enviar notificación al frontend si se excede el límite
            log.warn("Intento de agregar más de {} unidades al carrito para el producto {}", MAX_UNITS_PER_USER, productId);
            throw new IllegalArgumentException(
                String.format("Solo puedes comprar hasta %d unidades por producto. Intentas: %d",
                    MAX_UNITS_PER_USER, quantity)
            );
        }
        
        // ✅ USO DE BLOQUEO PESIMISTA para actualizar stock sin race conditions
        @SuppressWarnings("null")
        Product product = productRepository.findByIdForUpdate(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
        
        log.debug("🔵 Product locked for update: id={}, currentStock={}", productId, product.getStock());
        
        // ✅ Si aumenta la cantidad
        if (quantity > oldQuantity) {
            int quantityIncrease = quantity - oldQuantity;
            log.info("🔵 QUANTITY INCREASE - cartItemId={}, increase={} ({} -> {})", cartItemId, quantityIncrease, oldQuantity, quantity);
            
            // Validar que hay suficiente stock disponible
            if (product.getStock() < quantityIncrease) {
                log.error("❌ INSUFFICIENT STOCK - productId={}, available={}, needed={}", productId, product.getStock(), quantityIncrease);
                throw new IllegalArgumentException(
                    String.format("Stock insuficiente para aumentar. Disponible: %d, Necesitas: %d más",
                        product.getStock(), quantityIncrease)
                );
            }
            
            // ✅ DECREMENTAR el stock adicional en BD
            product.setStock(product.getStock() - quantityIncrease);
            productRepository.save(product);
            log.info("🟢 STOCK DECREMENTED - productId={}, decrease={}, newStock={}", 
                productId, quantityIncrease, product.getStock());
        } 
        // ✅ Si disminuye la cantidad
        else if (quantity < oldQuantity) {
            int quantityToRestore = oldQuantity - quantity;
            log.info("🔵 QUANTITY DECREASE - cartItemId={}, restore={} ({} -> {})", cartItemId, quantityToRestore, oldQuantity, quantity);
            
            // ✅ INCREMENTAR stock de vuelta en BD
            product.setStock(product.getStock() + quantityToRestore);
            productRepository.save(product);
            log.info("🟢 STOCK RESTORED - productId={}, restore={}, newStock={}", 
                productId, quantityToRestore, product.getStock());
        }
        // Si es igual, no hacer nada
        else {
            log.info("⚪ QUANTITY UNCHANGED - cartItemId={}, quantity={}", cartItemId, quantity);
        }
        
        cartItem.setQuantity(quantity);
        CartItem updated = cartItemRepository.save(cartItem);
        log.info("🟢 CART ITEM SAVED - cartItemId={}, newQuantity={}", cartItemId, updated.getQuantity());
        
        CartItemDTO result = convertToDTO(updated);
        
        // Verificar que el objeto result no sea nulo antes de acceder a sus propiedades
        if (result == null) {
            log.error("El objeto result es nulo. No se puede acceder a sus propiedades.");
            throw new IllegalStateException("El objeto result no puede ser nulo.");
        }

        // Asegurarse de que las propiedades de result sean válidas
        if (result.getId() == null || result.getProductId() == null || result.getQuantity() == null) {
            log.error("Propiedades nulas en el objeto result: id={}, productId={}, quantity={}",
                      result.getId(), result.getProductId(), result.getQuantity());
            throw new IllegalStateException("Propiedades nulas en el objeto result.");
        }

        log.info("🟢 updateItem() SUCCESS - returning CartItemDTO: id={}, productId={}, quantity={}", 
                 result.getId(), result.getProductId(), result.getQuantity());
        
        return result;
    }
    
    /**
     * ✅ NUEVO: Elimina item del carrito RESTAURANDO su stock en BD
     * Usa findByIdForUpdate() para bloqueo pesimista
     * Maneja casos de StaleObjectStateException cuando el item ya fue eliminado
     */
    public void removeItem(Long userId, Long cartItemId) {
        log.debug("🔵 removeItem() STARTED - userId={}, cartItemId={}", userId, cartItemId);
        
        CartItem cartItem;
        try {
            cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item del carrito no encontrado"));
        } catch (ResourceNotFoundException e) {
            // Si no existe el item, es como si ya fue eliminado - idempotent
            log.warn("⚠️ Cart item {} not found, returning successfully (idempotent)", cartItemId);
            return;
        }
        
        // Validar que el item pertenece al usuario
        if (!cartItem.getUser().getId().equals(userId)) {
            throw new SecurityException("No autorizado para eliminar este item");
        }
        
        long productId = cartItem.getProduct().getId();
        int quantityToRestore = cartItem.getQuantity();
        
        log.debug("removeItem() called: cartItemId={}, quantity={}, productId={}", 
            cartItemId, quantityToRestore, productId);
        
        try {
            // ✅ USO DE BLOQUEO PESIMISTA para evitar race conditions
            @SuppressWarnings("null")
            Product lockedProduct = productRepository.findByIdForUpdate(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
            
            // ✅ INCREMENTAR stock de vuelta en BD
            lockedProduct.setStock(lockedProduct.getStock() + quantityToRestore);
            productRepository.save(lockedProduct);
            log.info("Stock restored: productId={}, quantityRestored={}, newStock={}", 
                productId, quantityToRestore, lockedProduct.getStock());
            
            // Eliminar CartItem
            cartItemRepository.deleteById(Objects.requireNonNull(cartItemId, "cartItemId cannot be null"));
            log.info("🟢 Cart item removed: cartItemId={}", cartItemId);
        } catch (org.hibernate.StaleObjectStateException | org.springframework.orm.ObjectOptimisticLockingFailureException e) {
            // Si ocurre un error de concurrencia, el item ya fue eliminado por otra transacción
            log.warn("⚠️ StaleObjectState when removing cartItem {}: item was already deleted", cartItemId, e);
            // No relanzar excepción - es un caso válido de concurrencia
        }
    }
    
    /**
     * ✅ NUEVO: Limpia todo el carrito del usuario RESTAURANDO stock en BD
     * Usa findByIdForUpdate() para bloqueo pesimista en cada producto
     */
    public void clearCart(Long userId) {
        // Obtener todos los items del usuario para restaurar su stock
        List<CartItem> userItems = cartItemRepository.findByUserId(userId);
        
        log.debug("clearCart() called for userId={}, itemCount={}", userId, userItems.size());
        
        for (CartItem item : userItems) {
            long productId = item.getProduct().getId();
            int quantityToRestore = item.getQuantity();
            
            // ✅ USO DE BLOQUEO PESIMISTA para evitar race conditions
            @SuppressWarnings("null")
            Product lockedProduct = productRepository.findByIdForUpdate(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
            
            // ✅ INCREMENTAR stock de vuelta en BD
            lockedProduct.setStock(lockedProduct.getStock() + quantityToRestore);
            productRepository.save(lockedProduct);
            log.info("Stock restored on clear: productId={}, quantityRestored={}, newStock={}", 
                productId, quantityToRestore, lockedProduct.getStock());
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
                
            } else {
                // ✅ Asignar item anónimo al usuario
                anonItem.setUser(user);
                anonItem.setSessionId(null);
                cartItemRepository.save(anonItem);
                
                log.debug("Assigned anonymous cart item to user: productId={}, quantity={}", 
                    product.getId(), anonItem.getQuantity());
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
