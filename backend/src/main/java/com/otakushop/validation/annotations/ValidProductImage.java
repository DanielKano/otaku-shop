package com.otakushop.validation.annotations;

import com.otakushop.validation.validators.ProductImageValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Anotación de validación para URLs de imágenes de productos.
 * 
 * Valida que la URL:
 * - Tenga formato válido de URL
 * - Termine en extensión de imagen permitida (.jpg, .jpeg, .png, .webp)
 * - Use protocolo HTTPS (opcional, configurable)
 * 
 * Ejemplos válidos:
 * - "https://example.com/producto.jpg"
 * - "https://cdn.otakushop.com/images/manga-naruto.png"
 * - "https://storage.googleapis.com/products/figura.webp"
 * 
 * Ejemplos inválidos:
 * - "not-a-url" (formato inválido)
 * - "https://example.com/file.pdf" (no es imagen)
 * - "http://example.com/image.jpg" (no HTTPS, si requireHttps=true)
 */
@Documented
@Constraint(validatedBy = ProductImageValidator.class)
@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidProductImage {
    
    String message() default "La URL de la imagen no es válida";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
    
    /**
     * Requiere que la URL use HTTPS
     */
    boolean requireHttps() default true;
    
    /**
     * Extensiones permitidas
     */
    String[] allowedExtensions() default { "jpg", "jpeg", "png", "webp" };
}
