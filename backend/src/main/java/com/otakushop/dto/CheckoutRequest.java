package com.otakushop.dto;

import com.otakushop.validation.ValidCardData;
import com.otakushop.validation.ValidPaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO para solicitud de checkout
 * Validaciones completas para proceso de compra
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ValidCardData
public class CheckoutRequest {

    @NotNull(message = "El ID de usuario es obligatorio")
    private Long userId;

    @NotNull(message = "La dirección de envío es obligatoria")
    @Valid
    private ShippingAddressDTO shippingAddress;

    @NotBlank(message = "El método de pago es obligatorio")
    @ValidPaymentMethod
    private String paymentMethod;

    @Valid
    private PaymentDataDTO cardData;

    @NotNull(message = "Los items son obligatorios")
    @Size(min = 1, message = "Debe haber al menos un producto")
    private List<CheckoutItemDTO> items;

    @NotNull(message = "El subtotal es obligatorio")
    @DecimalMin(value = "0.0", inclusive = true, message = "El subtotal no puede ser negativo")
    private BigDecimal subtotal;

    @NotNull(message = "El costo de envío es obligatorio")
    @DecimalMin(value = "0.0", inclusive = true, message = "El costo de envío no puede ser negativo")
    private BigDecimal shipping;

    @NotNull(message = "El descuento es obligatorio")
    @DecimalMin(value = "0.0", inclusive = true, message = "El descuento no puede ser negativo")
    private BigDecimal discount;

    @NotNull(message = "El impuesto es obligatorio")
    @DecimalMin(value = "0.0", inclusive = true, message = "El impuesto no puede ser negativo")
    private BigDecimal tax;

    @NotNull(message = "El total es obligatorio")
    @DecimalMin(value = "10000.0", message = "El monto mínimo de orden es $10,000 COP")
    private BigDecimal total;

    private String couponCode;

    private String notes;
}
