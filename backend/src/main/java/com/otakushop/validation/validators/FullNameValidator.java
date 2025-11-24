package com.otakushop.validation.validators;

import com.otakushop.validation.annotations.ValidFullName;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Validador para la anotación @ValidFullName
 * Implementa validación estructural y semántica de nombres completos
 */
public class FullNameValidator implements ConstraintValidator<ValidFullName, String> {

    // Regex principal para formato de nombre (acepta espacios)
    private static final Pattern FULL_NAME_PATTERN = Pattern.compile(
        "^[A-Za-záéíóúÁÉÍÓÚñÑ]+([-'\\s][A-Za-záéíóúÁÉÍÓÚñÑ]+)*$"
    );

    // Patrones de spam
    private static final Pattern KEYBOARD_MASHING = Pattern.compile("asdf|qwerty|zxcv|hjkl|aoeu|jkl|dfgh", Pattern.CASE_INSENSITIVE);
    private static final Pattern LETTER_SEQUENCE = Pattern.compile("(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)", Pattern.CASE_INSENSITIVE);
    private static final Pattern NUMBER_SEQUENCE = Pattern.compile("(012|123|234|345|456|567|678|789|890|987|876|765|654|543|432|321|210)");
    private static final Pattern REPEATED_CHARS = Pattern.compile("(.)\\1{2,}");

    // Nombres cortos válidos (culturales)
    private static final Set<String> VALID_SHORT_NAMES = new HashSet<>(Arrays.asList(
        "Ana", "Ivo", "Eva", "Leo", "Max", "Ian", "Mia", "Kim", "Joe", "Sam",
        "Li", "Wu", "Yu", "Xi", "Bo", "Do", "Ji", "Yi", "Ari", "Eli",
        "Noe", "Roy", "Lou", "Pia", "Zoe", "Guy", "Kay", "Ray", "Ivy", "Amy",
        "de", "da", "di", "le", "el", "van", "von", "del", "las", "los"
    ));

    private int minWords;
    private boolean enableSemanticValidation;
    private boolean strictMode;

    @Override
    public void initialize(ValidFullName constraintAnnotation) {
        this.minWords = constraintAnnotation.minWords();
        this.enableSemanticValidation = constraintAnnotation.enableSemanticValidation();
        this.strictMode = constraintAnnotation.strictMode();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            addConstraintViolation(context, "El nombre completo es obligatorio");
            return false;
        }

        String trimmedName = value.trim();

        // Nivel 1: Validación estructural
        if (trimmedName.length() < 5) {
            addConstraintViolation(context, "El nombre debe tener al menos 5 caracteres");
            return false;
        }

        if (trimmedName.length() > 100) {
            addConstraintViolation(context, "El nombre no debe exceder 100 caracteres");
            return false;
        }

        if (!FULL_NAME_PATTERN.matcher(trimmedName).matches()) {
            addConstraintViolation(context, "El formato del nombre no es válido. Use solo letras, tildes, ñ, espacios, guiones y apóstrofes");
            return false;
        }

        // Nivel 2: Validación lógica
        String[] words = trimmedName.split("\\s+");
        if (words.length < minWords) {
            addConstraintViolation(context, "El nombre debe tener al menos " + minWords + " palabras");
            return false;
        }

        // Verificar longitud de palabras individuales
        for (String word : words) {
            String cleanWord = word.replaceAll("[-']", "");
            if (cleanWord.length() < 3 && !VALID_SHORT_NAMES.contains(word)) {
                addConstraintViolation(context, "El nombre contiene palabras muy cortas: " + word);
                return false;
            }
        }

        // Nivel 3: Validación semántica (anti-spam)
        if (enableSemanticValidation) {
            // Detectar tecleo aleatorio
            if (KEYBOARD_MASHING.matcher(trimmedName.toLowerCase()).find()) {
                addConstraintViolation(context, "El nombre parece ser tecleo aleatorio");
                return false;
            }

            // Detectar secuencias
            if (LETTER_SEQUENCE.matcher(trimmedName.toLowerCase()).find()) {
                addConstraintViolation(context, "El nombre contiene secuencias de letras sospechosas");
                return false;
            }

            if (NUMBER_SEQUENCE.matcher(trimmedName).find()) {
                addConstraintViolation(context, "El nombre contiene secuencias de números");
                return false;
            }

            // Detectar caracteres repetidos excesivos
            if (REPEATED_CHARS.matcher(trimmedName).find()) {
                if (strictMode) {
                    addConstraintViolation(context, "El nombre contiene caracteres repetidos excesivamente");
                    return false;
                }
            }

            // Verificar palabras repetidas
            Set<String> uniqueWords = new HashSet<>();
            for (String word : words) {
                String lowerWord = word.toLowerCase();
                if (!VALID_SHORT_NAMES.contains(word) && !uniqueWords.add(lowerWord)) {
                    if (strictMode) {
                        addConstraintViolation(context, "El nombre contiene palabras repetidas: " + word);
                        return false;
                    }
                }
            }

            // Calcular score de realismo
            int score = calculateRealismScore(trimmedName);
            if (score < 50 && strictMode) {
                addConstraintViolation(context, "El nombre parece sospechoso o poco realista");
                return false;
            }
        }

        return true;
    }

    /**
     * Calcula un puntaje de realismo (0-100)
     */
    private int calculateRealismScore(String fullName) {
        int score = 100;
        String[] words = fullName.split("\\s+");

        // Penalizar por palabras repetidas
        Set<String> uniqueWords = new HashSet<>();
        for (String word : words) {
            if (!uniqueWords.add(word.toLowerCase())) {
                score -= 30;
            }
        }

        // Penalizar por tecleo aleatorio
        if (KEYBOARD_MASHING.matcher(fullName.toLowerCase()).find()) {
            score -= 40;
        }

        // Penalizar por secuencias
        if (LETTER_SEQUENCE.matcher(fullName.toLowerCase()).find()) {
            score -= 35;
        }

        // Penalizar por caracteres repetidos
        if (REPEATED_CHARS.matcher(fullName).find()) {
            score -= 25;
        }

        // Verificar proporción de mayúsculas
        long upperCount = fullName.chars().filter(Character::isUpperCase).count();
        long lowerCount = fullName.chars().filter(Character::isLowerCase).count();
        long totalLetters = upperCount + lowerCount;

        if (totalLetters > 0) {
            double upperRatio = (double) upperCount / totalLetters;
            if (upperRatio > 0.5 && fullName.length() > 10) {
                score -= 20;
            }
            if (upperCount == 0) {
                score -= 10;
            }
        }

        return Math.max(0, score);
    }

    private void addConstraintViolation(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message).addConstraintViolation();
    }
}
