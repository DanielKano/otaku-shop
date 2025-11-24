package com.otakushop.validation;

import com.otakushop.dto.CheckoutRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Validador para datos de tarjeta.
 * Verifica que los datos de tarjeta estén presentes cuando el método de pago lo requiere.
 * Implementa algoritmo de Luhn para validar número de tarjeta.
 */
public class CardDataValidator implements ConstraintValidator<ValidCardData, CheckoutRequest> {

    private static final Set<String> CARD_PAYMENT_METHODS = new HashSet<>(Arrays.asList(
        "credit_card",
        "debit_card"
    ));

    @Override
    public void initialize(ValidCardData constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(CheckoutRequest request, ConstraintValidatorContext context) {
        if (request == null) {
            return false;
        }

        String paymentMethod = request.getPaymentMethod();
        
        // Si el método de pago requiere tarjeta
        if (paymentMethod != null && CARD_PAYMENT_METHODS.contains(paymentMethod.toLowerCase())) {
            if (request.getCardData() == null) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate(
                    "Los datos de la tarjeta son requeridos para pagos con tarjeta"
                ).addPropertyNode("cardData").addConstraintViolation();
                return false;
            }

            // Validar número de tarjeta con algoritmo de Luhn
            String cardNumber = request.getCardData().getCardNumber();
            if (cardNumber != null && !cardNumber.trim().isEmpty()) {
                String cleanNumber = cardNumber.replaceAll("[\\s-]", "");
                if (!luhnCheck(cleanNumber)) {
                    context.disableDefaultConstraintViolation();
                    context.buildConstraintViolationWithTemplate(
                        "El número de tarjeta no es válido"
                    ).addPropertyNode("cardData.cardNumber").addConstraintViolation();
                    return false;
                }
            }

            // Validar fecha de expiración
            String expiryDate = request.getCardData().getExpiryDate();
            if (expiryDate != null && !expiryDate.trim().isEmpty()) {
                if (!isValidExpiryDate(expiryDate)) {
                    context.disableDefaultConstraintViolation();
                    context.buildConstraintViolationWithTemplate(
                        "La tarjeta ha expirado o la fecha es inválida"
                    ).addPropertyNode("cardData.expiryDate").addConstraintViolation();
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Algoritmo de Luhn para validar número de tarjeta
     */
    private boolean luhnCheck(String cardNumber) {
        if (cardNumber == null || !cardNumber.matches("\\d+")) {
            return false;
        }

        int sum = 0;
        boolean isEven = false;

        for (int i = cardNumber.length() - 1; i >= 0; i--) {
            int digit = Character.getNumericValue(cardNumber.charAt(i));

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 == 0;
    }

    /**
     * Valida que la fecha de expiración no esté vencida
     */
    private boolean isValidExpiryDate(String expiryDate) {
        try {
            String[] parts = expiryDate.split("/");
            if (parts.length != 2) {
                return false;
            }

            int month = Integer.parseInt(parts[0]);
            int year = Integer.parseInt(parts[1]);

            // Convertir año de 2 dígitos a 4 dígitos
            if (year < 100) {
                year += 2000;
            }

            // Obtener fecha actual
            java.time.YearMonth now = java.time.YearMonth.now();
            java.time.YearMonth expiry = java.time.YearMonth.of(year, month);

            return !expiry.isBefore(now);
        } catch (Exception e) {
            return false;
        }
    }
}
