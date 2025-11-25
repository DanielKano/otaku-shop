package com.otakushop.validation.validators;

import com.otakushop.validation.annotations.ValidProductName;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

public class ProductNameValidator implements ConstraintValidator<ValidProductName, String> {

    private static final Pattern PRODUCT_NAME_PATTERN = Pattern.compile(
        "^[A-Za-z0-9][A-Za-záéíóúñ\\s\\-()&/,:'.]{1,98}[A-Za-z0-9]$"
    );
    
    private static final Pattern KEYBOARD_MASHING = Pattern.compile("asdf|qwer|zxcv|qwerty", Pattern.CASE_INSENSITIVE);

    private static final Set<String> CLICKBAIT_WORDS = new HashSet<>(Set.of(
        "gratis", "oferta", "increíble", "super", "mega", "ultra", "exclusivo", "limitado"
    ));

    @Override
    public void initialize(ValidProductName constraintAnnotation) {
        // Initialization if needed
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            addConstraintViolation(context, "El nombre del producto es obligatorio");
            return false;
        }

        String trimmedName = value.trim();

        if (!PRODUCT_NAME_PATTERN.matcher(trimmedName).matches()) {
            addConstraintViolation(context, "El nombre del producto no es válido o contiene patrones no permitidos.");
            return false;
        }
        
        if (KEYBOARD_MASHING.matcher(trimmedName).find()) {
            addConstraintViolation(context, "El nombre del producto parece ser tecleo aleatorio.");
            return false;
        }

        String[] words = trimmedName.toLowerCase().split("\\s+");
        Set<String> uniqueWords = new HashSet<>();
        for (String word : words) {
            if (!uniqueWords.add(word) && word.length() > 3) {
                addConstraintViolation(context, "El nombre contiene palabras repetidas: " + word);
                return false;
            }
        }

        long clickbaitCount = 0;
        for (String word : words) {
            if (CLICKBAIT_WORDS.contains(word)) {
                clickbaitCount++;
            }
        }
        if (clickbaitCount >= 2) {
            addConstraintViolation(context, "El nombre contiene demasiadas palabras promocionales (clickbait)");
            return false;
        }

        return true;
    }

    private void addConstraintViolation(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message).addConstraintViolation();
    }
}
