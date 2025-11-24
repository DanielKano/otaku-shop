package com.otakushop.validation;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import com.otakushop.dto.ShippingAddressDTO;
import com.otakushop.dto.CheckoutRequest;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class DepartmentValidatorTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testValidDepartment() {
        ShippingAddressDTO address = ShippingAddressDTO.builder()
                .street("Calle 123 #45-67")
                .city("Bogotá")
                .department("Bogotá D.C.")
                .postalCode("110111")
                .build();

        CheckoutRequest request = createRequestWithAddress(address);
        Set<ConstraintViolation<CheckoutRequest>> violations = validator.validate(request);
        assertTrue(violations.stream().noneMatch(v -> v.getMessage().contains("departamento")),
                "Should accept valid department");
    }

    @Test
    void testValidDepartmentAntioquia() {
        ShippingAddressDTO address = ShippingAddressDTO.builder()
                .street("Carrera 50 #20-30")
                .city("Medellín")
                .department("Antioquia")
                .postalCode("050001")
                .build();

        CheckoutRequest request = createRequestWithAddress(address);
        Set<ConstraintViolation<CheckoutRequest>> violations = validator.validate(request);
        assertTrue(violations.stream().noneMatch(v -> v.getMessage().contains("departamento")),
                "Should accept Antioquia");
    }

    @Test
    void testNullDepartment() {
        ShippingAddressDTO address = ShippingAddressDTO.builder()
                .street("Calle 123 #45-67")
                .city("Bogotá")
                .department(null)
                .postalCode("110111")
                .build();

        CheckoutRequest request = createRequestWithAddress(address);
        Set<ConstraintViolation<CheckoutRequest>> violations = validator.validate(request);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().contains("department")), 
                "Should reject null department");
    }

    @Test
    void testAllValidDepartments() {
        String[] validDepartments = {
            "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bogotá D.C.", "Bolívar",
            "Boyacá", "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó",
            "Córdoba", "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira",
            "Magdalena", "Meta", "Nariño", "Norte de Santander", "Putumayo", "Quindío",
            "Risaralda", "San Andrés y Providencia", "Santander", "Sucre", "Tolima",
            "Valle del Cauca", "Vaupés", "Vichada"
        };

        for (String department : validDepartments) {
            ShippingAddressDTO address = ShippingAddressDTO.builder()
                    .street("Calle Test #12-34")
                    .city("TestCity")
                    .department(department)
                    .postalCode("123456")
                    .build();

            CheckoutRequest request = createRequestWithAddress(address);
            Set<ConstraintViolation<CheckoutRequest>> violations = validator.validate(request);
            assertTrue(violations.stream().noneMatch(v -> v.getMessage().contains("departamento")),
                    "Should accept valid department: " + department);
        }
    }

    private CheckoutRequest createRequestWithAddress(ShippingAddressDTO address) {
        return CheckoutRequest.builder()
                .userId(1L)
                .shippingAddress(address)
                .paymentMethod("cash_on_delivery")
                .items(new ArrayList<>())
                .subtotal(BigDecimal.valueOf(50000))
                .shipping(BigDecimal.ZERO)
                .discount(BigDecimal.ZERO)
                .tax(BigDecimal.ZERO)
                .total(BigDecimal.valueOf(50000))
                .build();
    }
}
