package com.otakushop.validation.annotations;

import com.otakushop.validation.validators.StrictEmailValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Anotación de validación para correos electrónicos con whitelist de dominios.
 * 
 * Valida que el email cumpla con:
 * - Formato RFC 5322 estándar
 * - Dominio en la lista permitida (gmail, hotmail, outlook, yahoo, otaku, otakushop)
 * - Longitud de parte local entre 3 y 64 caracteres
 * - Sin caracteres especiales consecutivos (ej: user..name@)
 * 
 * Ejemplos válidos:
 * - "usuario@gmail.com"
 * - "maria.garcia@hotmail.com"
 * - "juan.perez+shop@outlook.com"
 * 
 * Ejemplos inválidos:
 * - "usuario@tempmail.com" (dominio no permitido)
 * - "ab@gmail.com" (parte local muy corta)
 * - "user..name@yahoo.com" (puntos consecutivos)
 */
@Documented
@Constraint(validatedBy = StrictEmailValidator.class)
@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidStrictEmail {
    
    String message() default "El correo electrónico no es válido o el dominio no está permitido";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
    
    /**
     * Verificar dominio en whitelist
     */
    boolean checkDomain() default true;
    
    /**
     * Dominios permitidos (por defecto: gmail, hotmail, outlook, yahoo, otaku, otakushop)
     */
    String[] allowedDomains() default {
        "gmail.com", 
        "hotmail.com", 
        "outlook.com", 
        "yahoo.com", 
        "otaku.com", 
        "otakushop.com"
    };
}
