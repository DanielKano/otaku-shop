package com.otakushop.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Validación personalizada para método de pago
 */
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PaymentMethodValidator.class)
@Documented
public @interface ValidPaymentMethod {
    String message() default "Método de pago no válido";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
