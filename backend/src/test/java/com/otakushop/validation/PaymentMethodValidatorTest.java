package com.otakushop.validation;

import com.otakushop.dto.CheckoutRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class PaymentMethodValidatorTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testValidPaymentMethodCreditCard() {
        CheckoutRequest request = CheckoutRequest.builder()
                .paymentMethod("credit_card")
                .total(BigDecimal.valueOf(50000))
                .build();

        Set<ConstraintViolation<CheckoutRequest>> violations = validator.validate(request);
        assertFalse(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("paymentMethod")),
                "Should accept credit_card");
    }

    @Test
    void testValidPaymentMethodDebitCard() {
        CheckoutRequest request = CheckoutRequest.builder()
                .paymentMethod("debit_card")
                .total(BigDecimal.valueOf(50000))
                .build();

        Set<ConstraintViolation<CheckoutRequest>> violations = validator.validate(request);
        assertFalse(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("paymentMethod")),
                "Should accept debit_card");
    }

    @Test
    void testValidPaymentMethodPSE() {
        CheckoutRequest request = CheckoutRequest.builder()
                .paymentMethod("pse")
                .total(BigDecimal.valueOf(50000))
                .build();

        Set<ConstraintViolation<CheckoutRequest>> violations = validator.validate(request);
        assertFalse(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("paymentMethod")),
                "Should accept pse");
    }

    @Test
    void testValidPaymentMethodCashOnDelivery() {
        CheckoutRequest request = CheckoutRequest.builder()
                .paymentMethod("cash_on_delivery")
                .total(BigDecimal.valueOf(50000))
                .build();

        Set<ConstraintViolation<CheckoutRequest>> violations = validator.validate(request);
        assertFalse(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("paymentMethod")),
                "Should accept cash_on_delivery");
    }

    @Test
    void testValidPaymentMethodBankTransfer() {
        CheckoutRequest request = CheckoutRequest.builder()
                .paymentMethod("bank_transfer")
                .total(BigDecimal.valueOf(50000))
                .build();

        Set<ConstraintViolation<CheckoutRequest>> violations = validator.validate(request);
        assertFalse(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("paymentMethod")),
                "Should accept bank_transfer");
    }

    @Test
    void testValidPaymentMethodNequi() {
        CheckoutRequest request = CheckoutRequest.builder()
                .paymentMethod("nequi")
                .total(BigDecimal.valueOf(50000))
                .build();

        Set<ConstraintViolation<CheckoutRequest>> violations = validator.validate(request);
        assertFalse(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("paymentMethod")),
                "Should accept nequi");
    }

    @Test
    void testValidPaymentMethodDaviplata() {
        CheckoutRequest request = CheckoutRequest.builder()
                .paymentMethod("daviplata")
                .total(BigDecimal.valueOf(50000))
                .build();

        Set<ConstraintViolation<CheckoutRequest>> violations = validator.validate(request);
        assertFalse(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("paymentMethod")),
                "Should accept daviplata");
    }

    @Test
    void testNullPaymentMethod() {
        CheckoutRequest request = CheckoutRequest.builder()
                .paymentMethod(null)
                .total(BigDecimal.valueOf(50000))
                .build();

        Set<ConstraintViolation<CheckoutRequest>> violations = validator.validate(request);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("paymentMethod")),
                "Should reject null payment method");
    }

    @Test
    void testPaymentMethodCaseInsensitive() {
        CheckoutRequest request = CheckoutRequest.builder()
                .paymentMethod("CREDIT_CARD") // Uppercase
                .total(BigDecimal.valueOf(50000))
                .build();

        Set<ConstraintViolation<CheckoutRequest>> violations = validator.validate(request);
        assertFalse(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("paymentMethod")),
                "Should accept uppercase payment method");
    }

    @Test
    void testPaymentMethodWithSpaces() {
        CheckoutRequest request = CheckoutRequest.builder()
                .paymentMethod("  credit_card  ") // With spaces
                .total(BigDecimal.valueOf(50000))
                .build();

        Set<ConstraintViolation<CheckoutRequest>> violations = validator.validate(request);
        assertFalse(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("paymentMethod")),
                "Should accept payment method with spaces");
    }
}
