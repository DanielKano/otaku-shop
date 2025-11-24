package com.otakushop.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para item individual en checkout
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutItemDTO {

    @NotNull(message = "El ID del producto es obligatorio")
    private Long productId;

    @NotBlank(message = "El nombre del producto es obligatorio")
    private String productName;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    @Max(value = 99, message = "La cantidad no puede exceder 99 unidades")
    private Integer quantity;

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    private BigDecimal price;

    private String imageUrl;
}
