package com.otakushop.validation.annotations;

import com.otakushop.validation.validators.ProductNameValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Anotación de validación para nombres de productos.
 * 
 * Valida que el nombre del producto cumpla con:
 * - Formato válido (alfanumérico, espacios, guiones, paréntesis)
 * - Longitud entre 3 y 100 caracteres
 * - No contiene spam (palabras repetidas, clickbait, mayúsculas excesivas)
 * - Coherencia con la categoría (opcional)
 * 
 * Ejemplos válidos:
 * - "Naruto Shippuden Tomo 1"
 * - "Figura Nendoroid Goku"
 * - "Camiseta One Piece Logo"
 * 
 * Ejemplos inválidos:
 * - "SUPER MEGA OFERTA ÚNICA" (clickbait)
 * - "Manga Manga Manga" (palabras repetidas)
 * - "AB" (muy corto)
 */
@Documented
@Constraint(validatedBy = ProductNameValidator.class)
@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidProductName {
    
    String message() default "El nombre del producto no es válido";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
    
    /**
     * Longitud mínima del nombre
     */
    int minLength() default 3;
    
    /**
     * Longitud máxima del nombre
     */
    int maxLength() default 100;
    
    /**
     * Habilitar verificación de coherencia con categoría
     */
    boolean enableCoherenceCheck() default true;
}
