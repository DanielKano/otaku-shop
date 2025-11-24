package com.otakushop.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Validación personalizada para datos de tarjeta
 * Valida que si el método de pago requiere tarjeta, los datos estén presentes
 */
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = CardDataValidator.class)
@Documented
public @interface ValidCardData {
    String message() default "Los datos de la tarjeta son requeridos para este método de pago";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
