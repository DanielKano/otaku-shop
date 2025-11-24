package com.otakushop.validation.validators;

import com.otakushop.validation.annotations.ValidProductName;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Validador para la anotación @ValidProductName
 * Implementa validación de nombres de productos con anti-spam y coherencia
 */
public class ProductNameValidator implements ConstraintValidator<ValidProductName, String> {

    // Regex para formato de nombre de producto
    private static final Pattern PRODUCT_NAME_PATTERN = Pattern.compile(
        "^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\\s\\-(),.!#]+$"
    );

    // Detectar exceso de mayúsculas
    private static final Pattern EXCESSIVE_CAPS = Pattern.compile("^(?:[A-Z].*){2,}[A-Z]{3,}");

    // Palabras clickbait
    private static final Set<String> CLICKBAIT_WORDS = new HashSet<>(Set.of(
        "gratis", "único", "oferta", "increíble", "super", "mega", "ultra", "extremo",
        "imperdible", "exclusivo", "limitado", "urgente"
    ));

    // Keywords por categoría
    private static final Map<String, Set<String>> CATEGORY_KEYWORDS = new HashMap<>();
    static {
        CATEGORY_KEYWORDS.put("Manga", Set.of("tomo", "vol", "volumen", "manga", "capítulo", "edición"));
        CATEGORY_KEYWORDS.put("Figura", Set.of("figura", "nendoroid", "figma", "scale", "pvc", "estatua", "muñeco"));
        CATEGORY_KEYWORDS.put("Ropa", Set.of("camiseta", "camisa", "sudadera", "hoodie", "playera", "polo", "pantalón"));
        CATEGORY_KEYWORDS.put("Accesorios", Set.of("llavero", "accesorio", "pulsera", "collar", "pin", "badge", "bolso"));
    }

    private int minLength;
    private int maxLength;
    private boolean enableCoherenceCheck;

    @Override
    public void initialize(ValidProductName constraintAnnotation) {
        this.minLength = constraintAnnotation.minLength();
        this.maxLength = constraintAnnotation.maxLength();
        this.enableCoherenceCheck = constraintAnnotation.enableCoherenceCheck();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            addConstraintViolation(context, "El nombre del producto es obligatorio");
            return false;
        }

        String trimmedName = value.trim();

        // Nivel 1: Longitud
        if (trimmedName.length() < minLength) {
            addConstraintViolation(context, "El nombre debe tener al menos " + minLength + " caracteres");
            return false;
        }

        if (trimmedName.length() > maxLength) {
            addConstraintViolation(context, "El nombre no debe exceder " + maxLength + " caracteres");
            return false;
        }

        // Nivel 2: Formato válido
        if (!PRODUCT_NAME_PATTERN.matcher(trimmedName).matches()) {
            addConstraintViolation(context, "El nombre contiene caracteres no permitidos");
            return false;
        }

        // Nivel 3: Anti-spam

        // Detectar palabras repetidas
        String[] words = trimmedName.toLowerCase().split("\\s+");
        Set<String> uniqueWords = new HashSet<>();
        for (String word : words) {
            if (!uniqueWords.add(word) && word.length() > 3) {
                addConstraintViolation(context, "El nombre contiene palabras repetidas: " + word);
                return false;
            }
        }

        // Detectar clickbait (2 o más palabras clickbait)
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

        // Detectar exceso de mayúsculas
        long upperCount = trimmedName.chars().filter(Character::isUpperCase).count();
        long letterCount = trimmedName.chars().filter(Character::isLetter).count();
        if (letterCount > 0) {
            double upperRatio = (double) upperCount / letterCount;
            if (upperRatio > 0.6 && trimmedName.length() > 10) {
                addConstraintViolation(context, "El nombre tiene demasiadas mayúsculas");
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
