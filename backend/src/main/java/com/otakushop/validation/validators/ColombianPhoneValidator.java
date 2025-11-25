package com.otakushop.validation.validators;

import com.otakushop.validation.annotations.ValidColombianPhone;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

public class ColombianPhoneValidator implements ConstraintValidator<ValidColombianPhone, String> {

    private static final Pattern COLOMBIAN_PHONE_PATTERN = Pattern.compile("^(300|301|302|303|304|305|310|311|312|313|314|315|316|317|318|319|320|321|322|323)\\d{7}$");
    private static final Pattern REPEATED_DIGITS_7_TIMES = Pattern.compile("(\\d)\\1{6}");
    private static final Pattern FORBIDDEN_SEQUENCES = Pattern.compile("1234567|0000000|9876543|1111111|2222222");
    private static final Pattern REPEATED_DIGITS_3_TIMES = Pattern.compile("(\\d)\\1{2}");

    @Override
    public void initialize(ValidColombianPhone constraintAnnotation) {
        // Initialization if needed
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            addConstraintViolation(context, "El número telefónico es obligatorio");
            return false;
        }

        String trimmedPhone = value.trim().replaceAll("[^\\d]", "");
        if (trimmedPhone.length() == 12 && trimmedPhone.startsWith("57")) {
            trimmedPhone = trimmedPhone.substring(2);
        }

        if (!COLOMBIAN_PHONE_PATTERN.matcher(trimmedPhone).matches()) {
            addConstraintViolation(context, "El número telefónico debe tener 10 dígitos y comenzar con un prefijo válido (300-323).");
            return false;
        }

        String lastSeven = trimmedPhone.substring(3);
        if (REPEATED_DIGITS_7_TIMES.matcher(lastSeven).matches()) {
            addConstraintViolation(context, "El número telefónico contiene dígitos repetidos excesivamente");
            return false;
        }

        if (FORBIDDEN_SEQUENCES.matcher(lastSeven).find()) {
            addConstraintViolation(context, "El número telefónico contiene secuencias no permitidas");
            return false;
        }

        if (REPEATED_DIGITS_3_TIMES.matcher(lastSeven).find()) {
            addConstraintViolation(context, "El número telefónico no debe tener 3 dígitos repetidos seguidos");
            return false;
        }

        return true;
    }

    private void addConstraintViolation(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message).addConstraintViolation();
    }
}
