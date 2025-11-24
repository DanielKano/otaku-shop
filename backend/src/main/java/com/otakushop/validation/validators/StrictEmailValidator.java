package com.otakushop.validation.validators;

import com.otakushop.validation.annotations.ValidStrictEmail;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Validador para la anotación @ValidStrictEmail
 * Implementa validación estricta de emails con whitelist de dominios
 */
public class StrictEmailValidator implements ConstraintValidator<ValidStrictEmail, String> {

    // Regex estricto para email (RFC 5322 simplificado)
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9][a-zA-Z0-9._+-]{1,62}[a-zA-Z0-9]@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
    );

    // Detectar caracteres especiales consecutivos
    private static final Pattern CONSECUTIVE_DOTS = Pattern.compile("\\.\\.");
    private static final Pattern CONSECUTIVE_SPECIAL = Pattern.compile("[._+-]{2,}");

    private boolean checkDomain;
    private Set<String> allowedDomains;

    @Override
    public void initialize(ValidStrictEmail constraintAnnotation) {
        this.checkDomain = constraintAnnotation.checkDomain();
        this.allowedDomains = new HashSet<>(Arrays.asList(constraintAnnotation.allowedDomains()));
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            addConstraintViolation(context, "El correo electrónico es obligatorio");
            return false;
        }

        String trimmedEmail = value.trim().toLowerCase();

        // Nivel 1: Formato básico
        if (!EMAIL_PATTERN.matcher(trimmedEmail).matches()) {
            addConstraintViolation(context, "El formato del correo electrónico no es válido");
            return false;
        }

        // Verificar longitud de parte local (antes de @)
        String[] parts = trimmedEmail.split("@");
        if (parts.length != 2) {
            addConstraintViolation(context, "El correo debe tener exactamente una @");
            return false;
        }

        String localPart = parts[0];
        String domain = parts[1];

        if (localPart.length() < 3) {
            addConstraintViolation(context, "La parte local del correo es muy corta (mínimo 3 caracteres)");
            return false;
        }

        if (localPart.length() > 64) {
            addConstraintViolation(context, "La parte local del correo es muy larga (máximo 64 caracteres)");
            return false;
        }

        // Verificar puntos consecutivos
        if (CONSECUTIVE_DOTS.matcher(localPart).find()) {
            addConstraintViolation(context, "El correo no puede tener puntos consecutivos");
            return false;
        }

        // Verificar caracteres especiales consecutivos
        if (CONSECUTIVE_SPECIAL.matcher(localPart).find()) {
            addConstraintViolation(context, "El correo no puede tener caracteres especiales consecutivos");
            return false;
        }

        // Nivel 2: Verificar dominio permitido
        if (checkDomain) {
            if (!allowedDomains.contains(domain)) {
                String allowedList = String.join(", ", allowedDomains);
                addConstraintViolation(context, 
                    "El dominio '" + domain + "' no está permitido. Dominios válidos: " + allowedList);
                return false;
            }
        }

        return true;
    }

    private void addConstraintViolation(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message).addConstraintViolation();
    }
}
