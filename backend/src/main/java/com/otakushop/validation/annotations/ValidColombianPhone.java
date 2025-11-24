package com.otakushop.validation.annotations;

import com.otakushop.validation.validators.ColombianPhoneValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Anotación de validación para números telefónicos colombianos.
 * 
 * Valida que el teléfono cumpla con:
 * - Formato de 10 dígitos numéricos
 * - Prefijos válidos de operadores colombianos:
 *   * Claro: 300-305, 310-314, 320-324
 *   * Movistar: 315-319, 350-353
 *   * Tigo: 312-314, 330-333
 *   * Virgin Mobile: 340-343
 *   * Avantel: 305
 * - Detección de números sospechosos (todos ceros, repetidos, secuencias)
 * 
 * Ejemplos válidos:
 * - "3001234567"
 * - "3157896541"
 * - "3124567890"
 * 
 * Ejemplos inválidos:
 * - "3009999999" (todos repetidos)
 * - "3001234567890" (muy largo)
 * - "2991234567" (prefijo inválido)
 */
@Documented
@Constraint(validatedBy = ColombianPhoneValidator.class)
@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidColombianPhone {
    
    String message() default "El número telefónico colombiano no es válido";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
    
    /**
     * Habilitar validación semántica (detectar números sospechosos)
     */
    boolean enableSemanticValidation() default true;
    
    /**
     * Modo estricto (rechazar números sospechosos)
     */
    boolean strictMode() default true;
}
