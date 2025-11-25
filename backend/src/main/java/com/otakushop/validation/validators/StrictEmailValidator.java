package com.otakushop.validation.validators;

import com.otakushop.validation.annotations.ValidStrictEmail;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

public class StrictEmailValidator implements ConstraintValidator<ValidStrictEmail, String> {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^(?=.{6,50}$)(?!.*\\.\\.)(?=[a-z0-9._%+-]{3,}@)[a-z0-9._%+-]{3,30}@(gmail|hotmail|outlook|yahoo|otaku|otakushop)\\.(com|co)$"
    );
    
    private static final Pattern REPEATED_CHARS_3_TIMES = Pattern.compile("(.)\\1{2}");

    @Override
    public void initialize(ValidStrictEmail constraintAnnotation) {
        // Initialization if needed
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            addConstraintViolation(context, "El correo electrónico es obligatorio");
            return false;
        }

        String trimmedEmail = value.trim().toLowerCase();

        if (!EMAIL_PATTERN.matcher(trimmedEmail).matches()) {
            addConstraintViolation(context, "El formato del correo electrónico no es válido o no cumple con las políticas del sitio");
            return false;
        }

        if (REPEATED_CHARS_3_TIMES.matcher(trimmedEmail.split("@")[0]).find()) {
            addConstraintViolation(context, "El nombre de usuario del correo no debe tener 3 caracteres iguales seguidos");
            return false;
        }

        return true;
    }

    private void addConstraintViolation(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message).addConstraintViolation();
    }
}
