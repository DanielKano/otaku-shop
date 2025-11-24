package com.otakushop.validation.validators;

import com.otakushop.validation.annotations.ValidProductImage;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Arrays;
import java.util.List;

/**
 * Validador para URLs de imágenes de productos.
 * 
 * Implementa validación en 2 niveles:
 * 1. Estructural: Formato válido de URL
 * 2. Lógica: Protocolo HTTPS y extensión de imagen
 */
public class ProductImageValidator implements ConstraintValidator<ValidProductImage, String> {
    
    private boolean requireHttps;
    private List<String> allowedExtensions;
    
    @Override
    public void initialize(ValidProductImage annotation) {
        this.requireHttps = annotation.requireHttps();
        this.allowedExtensions = Arrays.asList(annotation.allowedExtensions());
    }
    
    @Override
    public boolean isValid(String imageUrl, ConstraintValidatorContext context) {
        // Null o vacío se permite (usar @NotNull/@NotBlank para obligatoriedad)
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            return true;
        }
        
        String trimmed = imageUrl.trim();
        
        // Nivel 1: Validación Estructural - Formato de URL
        URL url;
        try {
            url = new URL(trimmed);
        } catch (MalformedURLException e) {
            buildViolation(context, "La URL de la imagen no tiene un formato válido");
            return false;
        }
        
        // Nivel 2: Validación Lógica
        
        // Verificar protocolo HTTPS si es requerido
        if (requireHttps && !"https".equalsIgnoreCase(url.getProtocol())) {
            buildViolation(context, 
                "La URL de la imagen debe usar protocolo HTTPS por seguridad");
            return false;
        }
        
        // Verificar extensión de archivo
        if (!hasValidExtension(trimmed, context)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Verifica que la URL termine en una extensión de imagen permitida
     */
    private boolean hasValidExtension(String url, ConstraintValidatorContext context) {
        String lowerUrl = url.toLowerCase();
        
        // Extraer la parte después del último '?' (para ignorar query params)
        String path = lowerUrl.split("\\?")[0];
        
        for (String ext : allowedExtensions) {
            if (path.endsWith("." + ext)) {
                return true;
            }
        }
        
        buildViolation(context, 
            String.format("La URL debe terminar en una extensión de imagen válida: %s", 
                String.join(", ", allowedExtensions)));
        return false;
    }
    
    /**
     * Construye una violación personalizada
     */
    private void buildViolation(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message).addConstraintViolation();
    }
}
