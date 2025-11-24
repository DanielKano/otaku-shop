package com.otakushop.validation;

import com.otakushop.dto.CheckoutRequest;
import com.otakushop.dto.PaymentDataDTO;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class CardDataValidatorTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testValidCreditCardWithLuhnCheck() {
        // Visa test card number (passes Luhn)
        PaymentDataDTO cardData = PaymentDataDTO.builder()
                .cardNumber("4532015112830366")
                .cardHolder("John Doe")
                .expiryDate(getValidExpiryDate())
                .cvv("123")
                .build();

        CheckoutRequest request = CheckoutRequest.builder()
                .paymentMethod("credit_card")
                .cardData(cardData)
                .total(BigDecimal.valueOf(50000))
                .build();

        Set<ConstraintViolation<CheckoutRequest>> violations = validator.validate(request);
        assertTrue(violations.stream().noneMatch(v -> v.getMessage().contains("tarjeta")),
                "Valid credit card should pass Luhn check");
    }

    @Test
    void testInvalidCardNumberLuhnCheck() {
        PaymentDataDTO cardData = PaymentDataDTO.builder()
                .cardNumber("4532015112830367") // Invalid Luhn
                .cardHolder("John Doe")
                .expiryDate(getValidExpiryDate())
                .cvv("123")
                .build();

        CheckoutRequest request = CheckoutRequest.builder()
                .paymentMethod("credit_card")
                .cardData(cardData)
                .total(BigDecimal.valueOf(50000))
                .build();

        Set<ConstraintViolation<CheckoutRequest>> violations = validator.validate(request);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("tarjeta")),
                "Invalid card number should fail Luhn check");
    }

    @Test
    void testDebitCardRequiresCardData() {
        CheckoutRequest request = CheckoutRequest.builder()
                .paymentMethod("debit_card")
                .cardData(null) // Missing card data
                .total(BigDecimal.valueOf(50000))
                .build();

        Set<ConstraintViolation<CheckoutRequest>> violations = validator.validate(request);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("tarjeta")),
                "Debit card payment should require card data");
    }

    @Test
    void testPSEDoesNotRequireCardData() {
        CheckoutRequest request = CheckoutRequest.builder()
                .paymentMethod("pse")
                .cardData(null) // No card data needed
                .total(BigDecimal.valueOf(50000))
                .build();

        Set<ConstraintViolation<CheckoutRequest>> violations = validator.validate(request);
        assertFalse(violations.stream().anyMatch(v -> v.getMessage().contains("tarjeta")),
                "PSE payment should not require card data");
    }

    @Test
    void testCashOnDeliveryDoesNotRequireCardData() {
        CheckoutRequest request = CheckoutRequest.builder()
                .paymentMethod("cash_on_delivery")
                .cardData(null)
                .total(BigDecimal.valueOf(50000))
                .build();

        Set<ConstraintViolation<CheckoutRequest>> violations = validator.validate(request);
        assertFalse(violations.stream().anyMatch(v -> v.getMessage().contains("tarjeta")),
                "Cash on delivery should not require card data");
    }

    @Test
    void testMastercardWithLuhn() {
        // Mastercard test number (passes Luhn)
        PaymentDataDTO cardData = PaymentDataDTO.builder()
                .cardNumber("5425233430109903")
                .cardHolder("Jane Smith")
                .expiryDate(getValidExpiryDate())
                .cvv("456")
                .build();

        CheckoutRequest request = CheckoutRequest.builder()
                .paymentMethod("credit_card")
                .cardData(cardData)
                .total(BigDecimal.valueOf(100000))
                .build();

        Set<ConstraintViolation<CheckoutRequest>> violations = validator.validate(request);
        assertTrue(violations.stream().noneMatch(v -> v.getMessage().contains("tarjeta")),
                "Valid Mastercard should pass");
    }

    @Test
    void testAmexWithLuhn() {
        // Amex test number (passes Luhn, 15 digits)
        PaymentDataDTO cardData = PaymentDataDTO.builder()
                .cardNumber("378282246310005")
                .cardHolder("Bob Johnson")
                .expiryDate(getValidExpiryDate())
                .cvv("1234") // Amex has 4-digit CVV
                .build();

        CheckoutRequest request = CheckoutRequest.builder()
                .paymentMethod("credit_card")
                .cardData(cardData)
                .total(BigDecimal.valueOf(75000))
                .build();

        Set<ConstraintViolation<CheckoutRequest>> violations = validator.validate(request);
        assertTrue(violations.stream().noneMatch(v -> v.getMessage().contains("tarjeta")),
                "Valid Amex should pass");
    }

    private String getValidExpiryDate() {
        YearMonth future = YearMonth.now().plusYears(2);
        return future.format(DateTimeFormatter.ofPattern("MM/yy"));
    }
}
