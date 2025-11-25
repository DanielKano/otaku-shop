package com.otakushop.service;

import com.otakushop.dto.CheckoutRequest;
import com.otakushop.dto.CheckoutItemDTO;
import com.otakushop.entity.Order;
import com.otakushop.entity.OrderItem;
import com.otakushop.entity.OrderStatus;
import com.otakushop.entity.Product;
import com.otakushop.entity.User;
import com.otakushop.repository.OrderRepository;
import com.otakushop.repository.ProductRepository;
import com.otakushop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Servicio para gestión de checkout y órdenes
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CheckoutService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    /**
     * Valida una solicitud de checkout sin procesarla
     */
    public Map<String, Object> validateCheckout(CheckoutRequest request) {
        Map<String, Object> validation = new HashMap<>();
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        // 1. Validar que el usuario existe
        @SuppressWarnings("null")
        boolean userExists = userRepository.existsById(request.getUserId());
        if (!userExists) {
            errors.add("Usuario no encontrado");
            validation.put("isValid", false);
            validation.put("errors", errors);
            return validation;
        }

        // 2. Validar stock disponible y reservaciones activas
        for (CheckoutItemDTO item : request.getItems()) {
            @SuppressWarnings("null")
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            if (product == null) {
                errors.add("Producto no encontrado: " + item.getProductName());
                continue;
            }

            if (product.getStock() < item.getQuantity()) {
                errors.add(String.format(
                    "Stock insuficiente para %s. Disponible: %d, Solicitado: %d",
                    product.getName(),
                    product.getStock(),
                    item.getQuantity()
                ));
            }

            // Advertencia si el stock es bajo
            if (product.getStock() < 10 && product.getStock() >= item.getQuantity()) {
                warnings.add(String.format(
                    "Stock bajo para %s: quedan %d unidades",
                    product.getName(),
                    product.getStock()
                ));
            }
        }

        // 3. Validar cálculo de totales
        BigDecimal calculatedSubtotal = calculateSubtotal(request.getItems());
        BigDecimal expectedTotal = calculatedSubtotal
            .add(request.getShipping())
            .subtract(request.getDiscount())
            .add(request.getTax());

        BigDecimal difference = expectedTotal.subtract(request.getTotal()).abs();
        if (difference.compareTo(new BigDecimal("0.01")) > 0) {
            errors.add(String.format(
                "Los totales no cuadran. Esperado: $%s, Recibido: $%s",
                expectedTotal.setScale(2, RoundingMode.HALF_UP),
                request.getTotal().setScale(2, RoundingMode.HALF_UP)
            ));
        }

        // 4. Validar monto mínimo
        if (request.getTotal().compareTo(new BigDecimal("10000")) < 0) {
            errors.add("El monto mínimo de orden es $10,000 COP");
        }

        validation.put("isValid", errors.isEmpty());
        validation.put("errors", errors);
        validation.put("warnings", warnings);
        validation.put("calculatedSubtotal", calculatedSubtotal);
        validation.put("expectedTotal", expectedTotal);

        return validation;
    }

    /**
     * Procesa el checkout y crea la orden
     */
    @Transactional
    public Order processCheckout(CheckoutRequest request) {
        // 1. Validar checkout
        Map<String, Object> validation = validateCheckout(request);
        if (!(Boolean) validation.get("isValid")) {
            @SuppressWarnings("unchecked")
            List<String> errors = (List<String>) validation.get("errors");
            throw new IllegalArgumentException("Checkout inválido: " + String.join(", ", errors));
        }

        // 2. Obtener usuario
        @SuppressWarnings("null")
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        // 3. Crear orden
        Order order = new Order();
        order.setUser(user);
        order.setSubtotal(request.getSubtotal());
        order.setShipping(request.getShipping());
        order.setDiscount(request.getDiscount());
        order.setTax(request.getTax());
        order.setTotal(request.getTotal());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus(OrderStatus.PENDING);
        order.setShippingAddress(formatAddress(request.getShippingAddress()));
        order.setNotes(request.getNotes());

        // 4. Crear items de la orden y actualizar stock
        for (CheckoutItemDTO itemDTO : request.getItems()) {
            @SuppressWarnings("null")
            Product product = productRepository.findById(itemDTO.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado: " + itemDTO.getProductId()));

            // Verificar stock nuevamente (doble verificación)
            if (product.getStock() < itemDTO.getQuantity()) {
                throw new IllegalStateException("Stock insuficiente para: " + product.getName());
            }

            // Reducir stock
            product.setStock(product.getStock() - itemDTO.getQuantity());
            productRepository.save(product);

            // Crear item de orden
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemDTO.getQuantity());
            orderItem.setUnitPrice(itemDTO.getPrice());
            orderItem.setSubtotal(itemDTO.getPrice().multiply(new BigDecimal(itemDTO.getQuantity())));
            orderItem.setProductName(product.getName());
            orderItem.setProductImageUrl(product.getImageUrl());
            
            order.getItems().add(orderItem);
        }

        // 5. Guardar orden
        Order savedOrder = orderRepository.save(order);

        log.info("Orden {} creada exitosamente para usuario {}", savedOrder.getId(), request.getUserId());

        return savedOrder;
    }

    /**
     * Calcula el subtotal basado en los items
     */
    private BigDecimal calculateSubtotal(List<CheckoutItemDTO> items) {
        return items.stream()
            .map(item -> item.getPrice().multiply(new BigDecimal(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Formatea la dirección para almacenamiento
     */
    private String formatAddress(com.otakushop.dto.ShippingAddressDTO address) {
        StringBuilder sb = new StringBuilder();
        sb.append(address.getStreet());
        sb.append(", ");
        sb.append(address.getCity());
        sb.append(", ");
        sb.append(address.getDepartment());
        sb.append(" - ");
        sb.append(address.getPostalCode());
        
        if (address.getAdditionalInfo() != null && !address.getAdditionalInfo().trim().isEmpty()) {
            sb.append(" (");
            sb.append(address.getAdditionalInfo());
            sb.append(")");
        }
        
        return sb.toString();
    }
}
