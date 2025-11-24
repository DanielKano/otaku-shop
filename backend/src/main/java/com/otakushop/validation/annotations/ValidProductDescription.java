package com.otakushop.validation.annotations;

import com.otakushop.validation.validators.ProductDescriptionValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Anotación de validación para descripciones de productos.
 * 
 * Valida que la descripción cumpla con:
 * - Longitud mínima de caracteres (por defecto 30)
 * - Longitud máxima de caracteres (por defecto 1000)
 * - Número mínimo de palabras (por defecto 10)
 * - Detección de spam (palabras repetidas excesivamente)
 * 
 * Ejemplos válidos:
 * - "Este manga de Naruto Shippuden tomo 1 cuenta la historia de..."
 * - "Figura coleccionable de alta calidad con detalles precisos..."
 * 
 * Ejemplos inválidos:
 * - "Muy bueno" (muy corto, pocas palabras)
 * - "Manga manga manga..." (palabras repetidas)
 */
@Documented
@Constraint(validatedBy = ProductDescriptionValidator.class)
@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidProductDescription {
    
    String message() default "La descripción del producto no es válida";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
    
    /**
     * Número mínimo de caracteres
     */
    int minChars() default 30;
    
    /**
     * Número máximo de caracteres
     */
    int maxChars() default 1000;
    
    /**
     * Número mínimo de palabras
     */
    int minWords() default 10;
    
    /**
     * Habilitar detección de spam
     */
    boolean enableSpamCheck() default true;
}
