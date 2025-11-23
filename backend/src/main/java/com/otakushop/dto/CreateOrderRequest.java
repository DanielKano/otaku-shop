package com.otakushop.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequest {
    
    @NotNull(message = "El carrito no puede estar vacío")
    @NotEmpty(message = "Debe contener al menos un producto")
    @Valid
    private List<OrderItemRequest> items;
    
    @NotBlank(message = "La dirección de envío es requerida")
    private String shippingAddress;
    
    @NotBlank(message = "La ciudad es requerida")
    private String shippingCity;
    
    @NotBlank(message = "El código postal es requerido")
    private String shippingPostalCode;
    
    @NotBlank(message = "El país es requerido")
    private String shippingCountry;
    
    @NotBlank(message = "El número telefónico es requerido")
    @Pattern(regexp = "^[0-9+\\-\\s()]+$", message = "Número telefónico inválido")
    private String phoneNumber;
    
    @NotBlank(message = "El método de pago es requerido")
    @Pattern(regexp = "^(CREDIT_CARD|DEBIT_CARD|BANK_TRANSFER|PAYPAL)$", 
             message = "Método de pago inválido")
    private String paymentMethod;
    
    private String notes;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemRequest {
        @NotNull(message = "ID del producto es requerido")
        @Positive(message = "ID del producto debe ser positivo")
        private Long productId;
        
        @NotNull(message = "La cantidad es requerida")
        @Positive(message = "La cantidad debe ser mayor a 0")
        private Integer quantity;
    }
}
