package com.otakushop.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.nio.file.Paths;

/**
 * ✅ Fase 7: Configuración de almacenamiento local de imágenes (DEV)
 * 
 * Sirve las imágenes desde el directorio local /uploads
 * Solo se activa en perfil 'dev' (spring.profiles.active=dev)
 */
@Configuration
@ConditionalOnProperty(
    name = "app.storage.type",
    havingValue = "local",
    matchIfMissing = true  // Por defecto, usar local en dev
)
public class LocalStorageConfig implements WebMvcConfigurer {
    
    private static final String UPLOADS_DIR = "uploads";
    
    @Override
    public void addResourceHandlers(@org.springframework.lang.NonNull ResourceHandlerRegistry registry) {
        // Mapear /images/** a directorio uploads/images
        String uploadsPath = Paths.get(UPLOADS_DIR, "images").toAbsolutePath().toUri().toString();
        
        registry.addResourceHandler("/images/**")
                .addResourceLocations(uploadsPath)
                .setCachePeriod(86400);  // Cache 1 día (24 horas)
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + Paths.get(UPLOADS_DIR).toAbsolutePath().toString() + "/")
                .setCachePeriod(86400);
    }
}
