package com.otakushop.service;

import com.otakushop.dto.CreateOrderRequest;
import com.otakushop.dto.OrderDTO;
import com.otakushop.dto.OrderItemDTO;
import com.otakushop.entity.*;
import com.otakushop.repository.OrderRepository;
import com.otakushop.repository.OrderItemRepository;
import com.otakushop.repository.ProductRepository;
import com.otakushop.repository.UserRepository;
import com.otakushop.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final SecurityUtil securityUtil;
    
    /**
     * Crea una nueva orden a partir del carrito
     */
    public OrderDTO createOrder(CreateOrderRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("El carrito no puede estar vacío");
        }
        
        // Crear la orden
        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PENDING)
                .shippingAddress(request.getShippingAddress())
                .shippingCity(request.getShippingCity())
                .shippingPostalCode(request.getShippingPostalCode())
                .shippingCountry(request.getShippingCountry())
                .phoneNumber(request.getPhoneNumber())
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .totalPrice(BigDecimal.ZERO)
                .build();
        
        // Procesar los items
        BigDecimal totalPrice = BigDecimal.ZERO;
        for (CreateOrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Producto no encontrado: " + itemRequest.getProductId()));
            
            if (!product.getActive() || !"APPROVED".equals(product.getStatus())) {
                throw new IllegalArgumentException(
                        "Producto no disponible: " + product.getName());
            }
            
            if (product.getStock() < itemRequest.getQuantity()) {
                throw new IllegalArgumentException(
                        "Stock insuficiente para " + product.getName());
            }
            
            BigDecimal unitPrice = product.getPrice();
            BigDecimal subtotal = unitPrice.multiply(new BigDecimal(itemRequest.getQuantity()));
            
            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .productName(product.getName())
                    .productImageUrl(product.getImageUrl())
                    .build();
            
            order.getItems().add(item);
            totalPrice = totalPrice.add(subtotal);
            
            // Actualizar stock del producto
            product.setStock(product.getStock() - itemRequest.getQuantity());
            productRepository.save(product);
        }
        
        order.setTotalPrice(totalPrice);
        Order savedOrder = orderRepository.save(order);
        
        log.info("Orden creada: ID={}, Usuario={}, Total={}", savedOrder.getId(), userId, totalPrice);
        return convertToDTO(savedOrder);
    }
    
    /**
     * Obtiene las órdenes del usuario autenticado
     */
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByCurrentUser() {
        Long userId = securityUtil.getCurrentUserId();
        List<Order> orders = orderRepository.findByUserIdWithItems(userId);
        return orders.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    /**
     * Obtiene una orden específica
     */
    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long orderId) {
        Long userId = securityUtil.getCurrentUserId();
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada"));
        
        // Verificar que la orden pertenece al usuario
        if (!order.getUser().getId().equals(userId)) {
            throw new SecurityException("No tienes permiso para acceder a esta orden");
        }
        
        return convertToDTO(order);
    }
    
    /**
     * Cancela una orden
     */
    public OrderDTO cancelOrder(Long orderId) {
        Long userId = securityUtil.getCurrentUserId();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada"));
        
        // Verificar que la orden pertenece al usuario
        if (!order.getUser().getId().equals(userId)) {
            throw new SecurityException("No tienes permiso para cancelar esta orden");
        }
        
        if (OrderStatus.CANCELLED.equals(order.getStatus())) {
            throw new IllegalArgumentException("La orden ya está cancelada");
        }
        
        if (OrderStatus.SHIPPED.equals(order.getStatus()) || 
            OrderStatus.DELIVERED.equals(order.getStatus())) {
            throw new IllegalArgumentException("No se puede cancelar una orden que ya fue enviada");
        }
        
        // Restaurar stock de productos
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledAt(LocalDateTime.now());
        Order cancelledOrder = orderRepository.save(order);
        
        log.info("Orden cancelada: ID={}, Usuario={}", orderId, userId);
        return convertToDTO(cancelledOrder);
    }
    
    /**
     * Actualiza el estado de una orden (ADMIN)
     */
    public OrderDTO updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada"));
        
        OrderStatus currentStatus = order.getStatus();
        
        // Validar transiciones permitidas
        validateStatusTransition(currentStatus, newStatus);
        
        order.setStatus(newStatus);
        
        if (OrderStatus.SHIPPED.equals(newStatus)) {
            order.setShippedAt(LocalDateTime.now());
        } else if (OrderStatus.DELIVERED.equals(newStatus)) {
            order.setDeliveredAt(LocalDateTime.now());
        }
        
        Order updatedOrder = orderRepository.save(order);
        log.info("Estado de orden actualizado: ID={}, Status={}", orderId, newStatus);
        return convertToDTO(updatedOrder);
    }
    
    /**
     * Valida las transiciones de estado permitidas
     */
    private void validateStatusTransition(OrderStatus current, OrderStatus target) {
        if (current.equals(target)) {
            return;
        }
        
        // Transiciones válidas
        switch (current) {
            case PENDING -> {
                if (!OrderStatus.CONFIRMED.equals(target) && !OrderStatus.CANCELLED.equals(target)) {
                    throw new IllegalArgumentException(
                            "No se puede cambiar de PENDING a " + target);
                }
            }
            case CONFIRMED -> {
                if (!OrderStatus.PROCESSING.equals(target) && !OrderStatus.CANCELLED.equals(target)) {
                    throw new IllegalArgumentException(
                            "No se puede cambiar de CONFIRMED a " + target);
                }
            }
            case PROCESSING -> {
                if (!OrderStatus.SHIPPED.equals(target) && !OrderStatus.FAILED.equals(target)) {
                    throw new IllegalArgumentException(
                            "No se puede cambiar de PROCESSING a " + target);
                }
            }
            case SHIPPED -> {
                if (!OrderStatus.DELIVERED.equals(target)) {
                    throw new IllegalArgumentException(
                            "No se puede cambiar de SHIPPED a " + target);
                }
            }
            case DELIVERED, CANCELLED, FAILED -> 
                throw new IllegalArgumentException(
                    "No se puede cambiar el estado de una orden " + current);
        }
    }
    
    /**
     * Convierte una orden a DTO
     */
    private OrderDTO convertToDTO(Order order) {
        List<OrderItemDTO> itemDTOs = order.getItems().stream()
                .map(item -> OrderItemDTO.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProductName())
                        .productImageUrl(item.getProductImageUrl())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .createdAt(item.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        
        return OrderDTO.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userName(order.getUser().getName())
                .userEmail(order.getUser().getEmail())
                .status(order.getStatus().name())
                .statusLabel(order.getStatus().getLabel())
                .totalPrice(order.getTotalPrice())
                .shippingAddress(order.getShippingAddress())
                .shippingCity(order.getShippingCity())
                .shippingPostalCode(order.getShippingPostalCode())
                .shippingCountry(order.getShippingCountry())
                .phoneNumber(order.getPhoneNumber())
                .paymentMethod(order.getPaymentMethod())
                .trackingNumber(order.getTrackingNumber())
                .notes(order.getNotes())
                .items(itemDTOs)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .shippedAt(order.getShippedAt())
                .deliveredAt(order.getDeliveredAt())
                .cancelledAt(order.getCancelledAt())
                .build();
    }
}
