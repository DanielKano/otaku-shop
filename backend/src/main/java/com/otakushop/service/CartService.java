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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {
    
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    
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
     * Agrega un producto al carrito
     */
    public CartItemDTO addItem(Long userId, CartItemRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        
        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
        
        // Validaciones
        if (request.getQuantity() <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
        }
        
        if (product.getStock() < request.getQuantity()) {
            throw new IllegalArgumentException("Stock insuficiente para este producto");
        }
        
        // Si ya existe en el carrito, incrementar cantidad
        CartItem existingItem = cartItemRepository
            .findByUserIdAndProductId(userId, request.getProductId())
            .orElse(null);
        
        if (existingItem != null) {
            existingItem.addQuantity(request.getQuantity());
            CartItem updated = cartItemRepository.save(existingItem);
            return convertToDTO(updated);
        }
        
        // Crear nuevo item
        CartItem cartItem = CartItem.builder()
            .user(user)
            .product(product)
            .quantity(request.getQuantity())
            .build();
        
        CartItem saved = cartItemRepository.save(cartItem);
        return convertToDTO(saved);
    }
    
    /**
     * Actualiza la cantidad de un item en el carrito
     */
    public CartItemDTO updateItem(Long userId, Long cartItemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new ResourceNotFoundException("Item del carrito no encontrado"));
        
        // Validar que el item pertenece al usuario
        if (!cartItem.getUser().getId().equals(userId)) {
            throw new SecurityException("No autorizado para modificar este item");
        }
        
        // Validaciones
        if (quantity <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
        }
        
        if (cartItem.getProduct().getStock() < quantity) {
            throw new IllegalArgumentException("Stock insuficiente para esta cantidad");
        }
        
        cartItem.setQuantity(quantity);
        CartItem updated = cartItemRepository.save(cartItem);
        return convertToDTO(updated);
    }
    
    /**
     * Elimina un item del carrito
     */
    public void removeItem(Long userId, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new ResourceNotFoundException("Item del carrito no encontrado"));
        
        // Validar que el item pertenece al usuario
        if (!cartItem.getUser().getId().equals(userId)) {
            throw new SecurityException("No autorizado para eliminar este item");
        }
        
        cartItemRepository.deleteById(cartItemId);
    }
    
    /**
     * Limpia todo el carrito del usuario
     */
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
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
