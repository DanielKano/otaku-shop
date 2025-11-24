package com.otakushop.validation.validators;

import com.otakushop.validation.annotations.ValidProductDescription;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.HashMap;
import java.util.Map;

/**
 * Validador para descripciones de productos.
 * 
 * Implementa validación en 3 niveles:
 * 1. Estructural: Longitud mínima/máxima de caracteres
 * 2. Lógica: Número mínimo de palabras
 * 3. Semántica: Detección de spam (palabras repetidas)
 */
public class ProductDescriptionValidator implements ConstraintValidator<ValidProductDescription, String> {
    
    private int minChars;
    private int maxChars;
    private int minWords;
    private boolean enableSpamCheck;
    
    // Umbral: una palabra puede repetirse máximo 5 veces
    private static final int MAX_WORD_REPETITIONS = 5;
    
    @Override
    public void initialize(ValidProductDescription annotation) {
        this.minChars = annotation.minChars();
        this.maxChars = annotation.maxChars();
        this.minWords = annotation.minWords();
        this.enableSpamCheck = annotation.enableSpamCheck();
    }
    
    @Override
    public boolean isValid(String description, ConstraintValidatorContext context) {
        // Null o vacío es inválido
        if (description == null || description.trim().isEmpty()) {
            buildViolation(context, "La descripción es obligatoria");
            return false;
        }
        
        String trimmed = description.trim();
        
        // Nivel 1: Validación Estructural
        if (!validateStructure(trimmed, context)) {
            return false;
        }
        
        // Nivel 2: Validación Lógica
        if (!validateWordCount(trimmed, context)) {
            return false;
        }
        
        // Nivel 3: Validación Semántica
        if (enableSpamCheck && !validateSpam(trimmed, context)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Nivel 1: Validación estructural de longitud de caracteres
     */
    private boolean validateStructure(String description, ConstraintValidatorContext context) {
        int length = description.length();
        
        if (length < minChars) {
            buildViolation(context, 
                String.format("La descripción debe tener al menos %d caracteres (actual: %d)", 
                    minChars, length));
            return false;
        }
        
        if (length > maxChars) {
            buildViolation(context, 
                String.format("La descripción no puede exceder %d caracteres (actual: %d)", 
                    maxChars, length));
            return false;
        }
        
        return true;
    }
    
    /**
     * Nivel 2: Validación lógica del número de palabras
     */
    private boolean validateWordCount(String description, ConstraintValidatorContext context) {
        // Contar palabras (separadas por espacios)
        String[] words = description.split("\\s+");
        int wordCount = words.length;
        
        if (wordCount < minWords) {
            buildViolation(context, 
                String.format("La descripción debe contener al menos %d palabras (actual: %d)", 
                    minWords, wordCount));
            return false;
        }
        
        return true;
    }
    
    /**
     * Nivel 3: Validación semántica - Detección de spam
     * Detecta si alguna palabra se repite más de MAX_WORD_REPETITIONS veces
     */
    private boolean validateSpam(String description, ConstraintValidatorContext context) {
        String[] words = description.toLowerCase().split("\\s+");
        Map<String, Integer> wordFrequency = new HashMap<>();
        
        // Contar frecuencia de cada palabra
        for (String word : words) {
            // Ignorar palabras muy cortas (artículos, preposiciones)
            if (word.length() <= 2) {
                continue;
            }
            
            wordFrequency.put(word, wordFrequency.getOrDefault(word, 0) + 1);
        }
        
        // Verificar si alguna palabra excede el umbral
        for (Map.Entry<String, Integer> entry : wordFrequency.entrySet()) {
            if (entry.getValue() > MAX_WORD_REPETITIONS) {
                buildViolation(context, 
                    String.format("La palabra '%s' se repite %d veces. " +
                        "Esto parece spam. Máximo permitido: %d repeticiones", 
                        entry.getKey(), entry.getValue(), MAX_WORD_REPETITIONS));
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Construye una violación personalizada
     */
    private void buildViolation(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message).addConstraintViolation();
    }
}
