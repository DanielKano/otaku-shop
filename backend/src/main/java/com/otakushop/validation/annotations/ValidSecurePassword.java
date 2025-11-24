package com.otakushop.validation.annotations;

import com.otakushop.validation.validators.SecurePasswordValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Anotación de validación para contraseñas seguras.
 * 
 * Valida que la contraseña cumpla con:
 * - Longitud mínima de 8 caracteres
 * - Al menos una mayúscula
 * - Al menos una minúscula
 * - Al menos un número
 * - Al menos un carácter especial (!@#$%^&*()_+-=[]{}|;:,.<>?)
 * - No contiene información personal (nombre, email)
 * - No está en la lista de contraseñas comunes
 * - Análisis de fortaleza (weak, medium, strong, very_strong)
 * 
 * Ejemplos válidos:
 * - "Segura123!"
 * - "MyP@ssw0rd2024"
 * - "C0mpl3x!Pass"
 * 
 * Ejemplos inválidos:
 * - "password123" (muy común)
 * - "JuanPerez123" (contiene nombre)
 * - "12345678" (sin mayúsculas ni símbolos)
 */
@Documented
@Constraint(validatedBy = SecurePasswordValidator.class)
@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidSecurePassword {
    
    String message() default "La contraseña no cumple con los requisitos de seguridad";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
    
    /**
     * Longitud mínima de la contraseña
     */
    int minLength() default 8;
    
    /**
     * Requiere al menos una mayúscula
     */
    boolean requireUppercase() default true;
    
    /**
     * Requiere al menos una minúscula
     */
    boolean requireLowercase() default true;
    
    /**
     * Requiere al menos un número
     */
    boolean requireNumber() default true;
    
    /**
     * Requiere al menos un carácter especial
     */
    boolean requireSpecial() default true;
    
    /**
     * Verificar contra lista de contraseñas comunes
     */
    boolean checkCommon() default true;
    
    /**
     * Habilitar análisis de fortaleza
     */
    boolean enableStrengthCheck() default true;
    
    /**
     * Nivel mínimo de fortaleza requerido (weak, medium, strong, very_strong)
     */
    String minStrength() default "medium";
}
