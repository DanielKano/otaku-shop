package com.otakushop.validation.annotations;

import com.otakushop.validation.validators.FullNameValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Anotación de validación para nombres completos.
 * 
 * Valida que el nombre cumpla con:
 * - Formato válido (letras, tildes, ñ, guiones, apóstrofes)
 * - Mínimo 2 palabras
 * - Longitud entre 5 y 100 caracteres
 * - Detección anti-spam (tecleo aleatorio, secuencias, repeticiones)
 * - Verificación semántica (palabras muy cortas, capitalización)
 * 
 * Ejemplos válidos:
 * - "Juan Pérez"
 * - "María José García López"
 * - "Jean-Pierre O'Connor"
 * 
 * Ejemplos inválidos:
 * - "asdfgh qwerty" (tecleo aleatorio)
 * - "Juan Juan" (palabras repetidas)
 * - "abc xyz" (palabras muy cortas)
 */
@Documented
@Constraint(validatedBy = FullNameValidator.class)
@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidFullName {
    
    String message() default "El nombre completo no es válido";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
    
    /**
     * Número mínimo de palabras requeridas
     */
    int minWords() default 2;
    
    /**
     * Habilitar validación semántica (anti-spam)
     */
    boolean enableSemanticValidation() default true;
    
    /**
     * Modo estricto (rechazar nombres sospechosos)
     */
    boolean strictMode() default true;
}
