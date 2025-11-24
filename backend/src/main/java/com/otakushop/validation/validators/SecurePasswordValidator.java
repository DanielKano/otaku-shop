package com.otakushop.validation.validators;

import com.otakushop.validation.annotations.ValidSecurePassword;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Validador para la anotación @ValidSecurePassword
 * Implementa validación de contraseñas seguras con análisis de fortaleza
 */
public class SecurePasswordValidator implements ConstraintValidator<ValidSecurePassword, String> {

    // Patrones de complejidad
    private static final Pattern UPPERCASE = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE = Pattern.compile("[a-z]");
    private static final Pattern NUMBER = Pattern.compile("\\d");
    private static final Pattern SPECIAL = Pattern.compile("[!@#$%^&*()_+\\-=\\[\\]{}|;:,.<>?]");
    private static final Pattern ALLOWED_CHARS = Pattern.compile("^[A-Za-z\\d!@#$%^&*()_+\\-=\\[\\]{}|;:,.<>?]+$");

    // Patrones anti-spam
    private static final Pattern LETTER_SEQUENCE = Pattern.compile("(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)", Pattern.CASE_INSENSITIVE);
    private static final Pattern NUMBER_SEQUENCE = Pattern.compile("(012|123|234|345|456|567|678|789|890|987|876|765|654|543|432|321|210)");
    private static final Pattern REPEATED_CHARS = Pattern.compile("(.)\\1{2,}");

    // Contraseñas comunes
    private static final Set<String> COMMON_PASSWORDS = new HashSet<>(Arrays.asList(
        "password", "123456", "12345678", "qwerty", "abc123", "monkey", "1234567",
        "letmein", "trustno1", "dragon", "baseball", "iloveyou", "master", "sunshine",
        "ashley", "bailey", "passw0rd", "shadow", "123123", "654321", "superman",
        "qazwsx", "michael", "football", "welcome", "jesus", "ninja", "mustang",
        "password1", "admin", "admin123", "root", "toor", "pass", "test", "guest",
        "changeme", "password123", "user", "administrator", "administrator123"
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
        if (value == null || value.trim().isEmpty()) {
            addConstraintViolation(context, "La contraseña es obligatoria");
            return false;
        }

        // Nivel 1: Longitud mínima
        if (value.length() < minLength) {
            addConstraintViolation(context, "La contraseña debe tener al menos " + minLength + " caracteres");
            return false;
        }

        // Verificar caracteres permitidos
        if (!ALLOWED_CHARS.matcher(value).matches()) {
            addConstraintViolation(context, "La contraseña contiene caracteres no permitidos");
            return false;
        }

        // Nivel 2: Requisitos de complejidad
        StringBuilder missingRequirements = new StringBuilder();

        if (requireUppercase && !UPPERCASE.matcher(value).find()) {
            missingRequirements.append("al menos una mayúscula, ");
        }

        if (requireLowercase && !LOWERCASE.matcher(value).find()) {
            missingRequirements.append("al menos una minúscula, ");
        }

        if (requireNumber && !NUMBER.matcher(value).find()) {
            missingRequirements.append("al menos un número, ");
        }

        if (requireSpecial && !SPECIAL.matcher(value).find()) {
            missingRequirements.append("al menos un carácter especial, ");
        }

        if (missingRequirements.length() > 0) {
            String requirements = missingRequirements.substring(0, missingRequirements.length() - 2);
            addConstraintViolation(context, "La contraseña debe contener " + requirements);
            return false;
        }

        // Nivel 3: Verificar contraseñas comunes
        if (checkCommon && COMMON_PASSWORDS.contains(value.toLowerCase())) {
            addConstraintViolation(context, "Esta contraseña es muy común y fácil de adivinar. Por favor elige una contraseña más segura");
            return false;
        }

        // Nivel 4: Análisis de fortaleza
        if (enableStrengthCheck) {
            StrengthResult strengthResult = calculatePasswordStrength(value);
            
            int requiredStrengthLevel = getStrengthLevel(minStrength);
            int actualStrengthLevel = getStrengthLevel(strengthResult.strength);

            if (actualStrengthLevel < requiredStrengthLevel) {
                addConstraintViolation(context, 
                    "La contraseña es demasiado débil. Nivel actual: " + strengthResult.strength + 
                    ", requerido: " + minStrength + ". Sugerencias: " + String.join(", ", strengthResult.feedback));
                return false;
            }
        }

        return true;
    }

    /**
     * Calcula la fortaleza de una contraseña
     */
    private StrengthResult calculatePasswordStrength(String password) {
        int score = 0;
        StringBuilder feedback = new StringBuilder();

        // Longitud (máx 25 puntos)
        int length = password.length();
        if (length >= 8) score += 10;
        if (length >= 12) score += 5;
        if (length >= 16) score += 5;
        if (length >= 20) score += 5;

        // Complejidad (máx 40 puntos)
        boolean hasUpper = UPPERCASE.matcher(password).find();
        boolean hasLower = LOWERCASE.matcher(password).find();
        boolean hasNumber = NUMBER.matcher(password).find();
        boolean hasSpecial = SPECIAL.matcher(password).find();

        if (hasUpper) score += 10;
        if (hasLower) score += 10;
        if (hasNumber) score += 10;
        if (hasSpecial) score += 10;

        // Variedad (máx 20 puntos)
        long uniqueChars = password.chars().distinct().count();
        if (uniqueChars >= 8) score += 10;
        if (uniqueChars >= 12) score += 5;
        if (uniqueChars >= 16) score += 5;

        // No contiene patrones obvios (máx 15 puntos)
        boolean hasSequence = LETTER_SEQUENCE.matcher(password.toLowerCase()).find() || 
                             NUMBER_SEQUENCE.matcher(password).find();
        boolean hasRepeat = REPEATED_CHARS.matcher(password).find();

        if (!hasSequence) score += 8;
        else feedback.append("evita secuencias");

        if (!hasRepeat) score += 7;
        else {
            if (feedback.length() > 0) feedback.append(", ");
            feedback.append("evita caracteres repetidos");
        }

        // Determinar nivel
        String strength;
        if (score < 40) strength = "weak";
        else if (score < 60) strength = "medium";
        else if (score < 80) strength = "strong";
        else strength = "very_strong";

        return new StrengthResult(score, strength, feedback.toString());
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

    private void addConstraintViolation(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message).addConstraintViolation();
    }

    private static class StrengthResult {
        final int score;
        final String strength;
        final String feedback;

        StrengthResult(int score, String strength, String feedback) {
            this.score = score;
            this.strength = strength;
            this.feedback = feedback;
        }
    }
}
