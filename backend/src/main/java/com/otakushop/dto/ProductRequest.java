package com.otakushop.dto;

import com.otakushop.validation.annotations.ValidProductName;
import com.otakushop.validation.annotations.ValidProductDescription;
import com.otakushop.validation.annotations.ValidProductImage;
import lombok.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

/**
 * DTO para creación/actualización de productos con validaciones avanzadas.
 * Utiliza anotaciones personalizadas para validación estricta de:
 * - Nombre de producto (anti-spam, coherencia con categoría)
 * - Descripción (longitud, palabras mínimas, anti-spam)
 * - Imágenes (formato URL, extensiones válidas)
 * - Stock (entero no negativo)
 * - Precio (rango válido, mayor a 0)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRequest {
    
    @ValidProductName(
        message = "El nombre del producto no es válido",
        minLength = 3,
        maxLength = 100,
        enableCoherenceCheck = true
    )
    private String name;

    @NotBlank(message = "La descripción es obligatoria")
    @ValidProductDescription(
        minChars = 30,
        maxChars = 1000,
        minWords = 10,
        enableSpamCheck = true
    )
    private String description;

    @NotNull(message = "El precio es requerido")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    @DecimalMax(value = "1000000000.00", message = "El precio no puede exceder 1,000,000,000")
    private BigDecimal price;

    @DecimalMin(value = "0.01", message = "El precio original debe ser mayor a 0")
    private BigDecimal originalPrice;

    @NotBlank(message = "La categoría es requerida")
    @Pattern(regexp = "^(Manga|Figura|Ropa|Accesorios)$", 
             message = "La categoría debe ser: Manga, Figura, Ropa o Accesorios")
    private String category;

    @NotNull(message = "El stock es requerido")
    @Min(value = 0, message = "El stock no puede ser negativo")
    @Max(value = 100000, message = "El stock no puede exceder 100,000 unidades")
    private Integer stock;

    @ValidProductImage(
        requireHttps = false, // Permitir HTTP para desarrollo
        allowedExtensions = {"jpg", "jpeg", "png", "webp"}
    )
    private String imageUrl;

    @Builder.Default
    private Boolean active = true;
}

