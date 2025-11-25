package com.otakushop.validation.validators;

import com.otakushop.validation.annotations.ValidSecurePassword;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

public class SecurePasswordValidator implements ConstraintValidator<ValidSecurePassword, String> {

    private static final Set<String> COMMON_PASSWORDS = new HashSet<>(Arrays.asList(
        "password", "123456", "12345678", "qwerty", "abc123"
    ));

    private int minLength;
    private boolean requireUppercase;
    private boolean requireLowercase;
    private boolean requireNumber;
    private boolean requireSpecial;
    private boolean checkCommon;
    private boolean enableStrengthCheck;
    private String minStrength;

    @Override
    public void initialize(ValidSecurePassword constraintAnnotation) {
        this.minLength = constraintAnnotation.minLength();
        this.requireUppercase = constraintAnnotation.requireUppercase();
        this.requireLowercase = constraintAnnotation.requireLowercase();
        this.requireNumber = constraintAnnotation.requireNumber();
        this.requireSpecial = constraintAnnotation.requireSpecial();
        this.checkCommon = constraintAnnotation.checkCommon();
        this.enableStrengthCheck = constraintAnnotation.enableStrengthCheck();
        this.minStrength = constraintAnnotation.minStrength();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isEmpty()) {
            addConstraintViolation(context, "La contraseña es obligatoria");
            return false;
        }

        // Check minimum length
        if (value.length() < minLength) {
            addConstraintViolation(context, "La contraseña debe tener al menos " + minLength + " caracteres");
            return false;
        }

        // Check for uppercase if required
        if (requireUppercase && !value.matches(".*[A-Z].*")) {
            addConstraintViolation(context, "La contraseña debe contener al menos una mayúscula");
            return false;
        }

        // Check for lowercase if required
        if (requireLowercase && !value.matches(".*[a-z].*")) {
            addConstraintViolation(context, "La contraseña debe contener al menos una minúscula");
            return false;
        }

        // Check for number if required
        if (requireNumber && !value.matches(".*\\d.*")) {
            addConstraintViolation(context, "La contraseña debe contener al menos un número");
            return false;
        }

        // Check for special character if required
        if (requireSpecial && !value.matches(".*[!@#$%^&*()_+\\-=\\[\\]{}|;:,.<>?].*")) {
            addConstraintViolation(context, "La contraseña debe contener al menos un carácter especial");
            return false;
        }

        // Check for spaces (always not allowed)
        if (value.matches(".*\\s.*")) {
            addConstraintViolation(context, "La contraseña no debe contener espacios");
            return false;
        }
        
        if (checkCommon && COMMON_PASSWORDS.contains(value.toLowerCase())) {
            addConstraintViolation(context, "Esta contraseña es muy común y fácil de adivinar. Por favor elige una contraseña más segura");
            return false;
        }
        
        if (enableStrengthCheck) {
            StrengthResult strengthResult = calculatePasswordStrength(value);
            
            int requiredStrengthLevel = getStrengthLevel(minStrength);
            int actualStrengthLevel = getStrengthLevel(strengthResult.strength);

            if (actualStrengthLevel < requiredStrengthLevel) {
                addConstraintViolation(context, 
                    "La contraseña es demasiado débil. Nivel actual: " + strengthResult.strength + 
                    ", requerido: " + minStrength);
                return false;
            }
        }

        return true;
    }

    private int getStrengthLevel(String strength) {
        return switch (strength) {
            case "weak" -> 1;
            case "medium" -> 2;
            case "strong" -> 3;
            case "very_strong" -> 4;
            default -> 0;
        };
    }

    private StrengthResult calculatePasswordStrength(String password) {
        // This is a simplified strength calculation, as the main validation is done by the regex.
        // You can expand this to provide more detailed feedback if needed.
        int score = 0;
        if (password.length() >= 12) score += 20;
        if (password.chars().distinct().count() >= 10) score += 20;
        
        String strength;
        if (score < 20) strength = "weak";
        else if (score < 40) strength = "medium";
        else strength = "strong";

        return new StrengthResult(score, strength);
    }

    private void addConstraintViolation(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message).addConstraintViolation();
    }

    private static class StrengthResult {
        final int score;
        final String strength;

        StrengthResult(int score, String strength) {
            this.score = score;
            this.strength = strength;
        }
    }
}
