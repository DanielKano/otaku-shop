package com.otakushop.validation.validators;

import com.otakushop.validation.annotations.ValidColombianPhone;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

/**
 * Validador para la anotación @ValidColombianPhone
 * Implementa validación de números telefónicos colombianos con detección de spam
 */
public class ColombianPhoneValidator implements ConstraintValidator<ValidColombianPhone, String> {

    // Prefijos válidos de operadores colombianos
    private static final Pattern COLOMBIAN_PHONE_PATTERN = Pattern.compile(
        "^(300|301|302|303|304|305|310|311|312|313|314|315|316|317|318|319|320|321|322|323|324|325|330|331|332|333|340|341|342|343|350|351|352|353)\\d{7}$"
    );

    // Patrones sospechosos
    private static final Pattern ALL_ZEROS = Pattern.compile("^0+$");
    private static final Pattern SEQUENTIAL = Pattern.compile("(0123456|1234567|2345678|3456789|9876543|8765432|7654321|6543210)");

    private boolean enableSemanticValidation;
    private boolean strictMode;

    @Override
    public void initialize(ValidColombianPhone constraintAnnotation) {
        this.enableSemanticValidation = constraintAnnotation.enableSemanticValidation();
        this.strictMode = constraintAnnotation.strictMode();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            addConstraintViolation(context, "El número telefónico es obligatorio");
            return false;
        }

        String trimmedPhone = value.trim();

        // Nivel 1: Formato válido
        if (!COLOMBIAN_PHONE_PATTERN.matcher(trimmedPhone).matches()) {
            addConstraintViolation(context, 
                "El número telefónico debe tener 10 dígitos y comenzar con un prefijo válido " +
                "(Claro: 300-305, 310-314, 320-324 | Movistar: 315-319, 350-353 | Tigo: 312-314, 330-333)");
            return false;
        }

        // Nivel 2: Validación semántica (anti-spam)
        if (enableSemanticValidation) {
            // Detectar todos ceros
            if (ALL_ZEROS.matcher(trimmedPhone).find()) {
                addConstraintViolation(context, "El número telefónico no puede ser todo ceros");
                return false;
            }

            // Detectar últimos 7 dígitos repetidos
            String lastSeven = trimmedPhone.substring(3);
            if (lastSeven.matches("(\\d)\\1{6}")) {
                if (strictMode) {
                    addConstraintViolation(context, "El número telefónico contiene dígitos repetidos excesivamente");
                    return false;
                }
            }

            // Detectar secuencias
            if (SEQUENTIAL.matcher(trimmedPhone).find()) {
                if (strictMode) {
                    addConstraintViolation(context, "El número telefónico contiene secuencias sospechosas");
                    return false;
                }
            }

            // Detectar patrón alternante (ej: 3001010101)
            if (trimmedPhone.matches("^(\\d{3})(\\d)(\\d)\\2\\3\\2\\3.*")) {
                if (strictMode) {
                    addConstraintViolation(context, "El número telefónico contiene un patrón sospechoso");
                    return false;
                }
            }
        }

        return true;
    }

    private void addConstraintViolation(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message).addConstraintViolation();
    }
}
