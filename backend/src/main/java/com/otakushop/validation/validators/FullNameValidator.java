package com.otakushop.validation.validators;

import com.otakushop.validation.annotations.ValidFullName;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

public class FullNameValidator implements ConstraintValidator<ValidFullName, String> {

    private static final Pattern REPEATED_LETTERS_3_TIMES = Pattern.compile("([A-Za-zÁÉÍÓÚáéíóúñÑ])\\1{2}");
    private static final Pattern REPEATED_WORD = Pattern.compile("\\b([A-Za-zÁÉÍÓÚáéíóúñÑ]+)\\b\\s+\\1\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern KEYBOARD_MASHING_EXTENDED = Pattern.compile("asdf|qwer|zxcv|qwerty|abc|abcd|123|1234", Pattern.CASE_INSENSITIVE);
    private static final Pattern FOUR_VOWELS_IN_A_ROW = Pattern.compile("[aeiouAEIOUáéíóú]{4,}");
    private static final Pattern FOUR_CONSONANTS_IN_A_ROW = Pattern.compile("[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZñÑ]{4,}");
    private static final Pattern ONLY_VOWELS = Pattern.compile("^[aeiouAEIOUáéíóú]+$");
    private static final Pattern ONLY_CONSONANTS = Pattern.compile("^[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZñÑ]+$");
    private static final Pattern NO_DOUBLE_SPACES = Pattern.compile(".*\\s{2,}.*");

    private static final Set<String> VALID_SHORT_NAMES = new HashSet<>(Arrays.asList(
        "Ana", "Luz", "Eva", "Mia", "Leo", "Ian", "Ivo", "Ada", "Li"
    ));

    @Override
    public void initialize(ValidFullName constraintAnnotation) {
        // Initialization if needed from annotation
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isEmpty()) {
            addConstraintViolation(context, "El nombre completo es obligatorio");
            return false;
        }

        if (value.trim().length() != value.length()) {
            addConstraintViolation(context, "El nombre no debe empezar o terminar con espacios");
            return false;
        }
        
        if (NO_DOUBLE_SPACES.matcher(value).matches()) {
            addConstraintViolation(context, "El nombre no debe contener doble espacio");
            return false;
        }

        if (value.length() < 3 || value.length() > 60) {
            addConstraintViolation(context, "El nombre debe tener entre 3 y 60 caracteres");
            return false;
        }

        if (!Pattern.matches("^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$", value)) {
            addConstraintViolation(context, "El nombre solo puede contener letras y espacios del alfabeto español");
            return false;
        }
        
        if (ONLY_VOWELS.matcher(value).matches()) {
            addConstraintViolation(context, "El nombre no puede consistir solo de vocales");
            return false;
        }

        if (ONLY_CONSONANTS.matcher(value).matches()) {
            addConstraintViolation(context, "El nombre no puede consistir solo de consonantes");
            return false;
        }
        
        if (REPEATED_LETTERS_3_TIMES.matcher(value).find()) {
            addConstraintViolation(context, "El nombre no debe repetir la misma letra 3 o más veces seguidas");
            return false;
        }
        
        if (REPEATED_WORD.matcher(value).find()) {
            addConstraintViolation(context, "El nombre no debe contener palabras repetidas");
            return false;
        }
        
        if (KEYBOARD_MASHING_EXTENDED.matcher(value).find()) {
            addConstraintViolation(context, "El nombre contiene patrones de teclado aleatorio (ej. 'asdf')");
            return false;
        }

        if (FOUR_VOWELS_IN_A_ROW.matcher(value).find()) {
            addConstraintViolation(context, "El nombre no debe tener 4 o más vocales seguidas");
            return false;
        }

        if (FOUR_CONSONANTS_IN_A_ROW.matcher(value).find()) {
            addConstraintViolation(context, "El nombre no debe tener 4 o más consonantes seguidas");
            return false;
        }

        String[] words = value.split("\\s+");
        for (String word : words) {
            if (word.length() < 3 && !VALID_SHORT_NAMES.contains(word)) {
                addConstraintViolation(context, "El nombre contiene palabras muy cortas: " + word);
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
