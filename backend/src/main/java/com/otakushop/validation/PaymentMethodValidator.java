package com.otakushop.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Validador para métodos de pago
 */
public class PaymentMethodValidator implements ConstraintValidator<ValidPaymentMethod, String> {

    private static final Set<String> VALID_PAYMENT_METHODS = new HashSet<>(Arrays.asList(
        "credit_card",
        "debit_card",
        "pse",
        "cash_on_delivery",
        "bank_transfer",
        "nequi",
        "daviplata"
    ));

    @Override
    public void initialize(ValidPaymentMethod constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(String paymentMethod, ConstraintValidatorContext context) {
        if (paymentMethod == null || paymentMethod.trim().isEmpty()) {
            return false;
        }
        return VALID_PAYMENT_METHODS.contains(paymentMethod.trim().toLowerCase());
    }
}
