package com.otakushop.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
@Slf4j
public class WebConfig implements WebMvcConfigurer {
    @Value("${cors.allowedOrigins}")
    private String allowedOrigins;

    @Value("${cors.allowedMethods}")
    private String allowedMethods;

    @Value("${cors.allowedHeaders}")
    private String allowedHeaders;

    @Value("${cors.allowCredentials}")
    private boolean allowCredentials;

    @Value("${file.upload-dir:uploads/images}")
    private String uploadDir;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins.split(","))
                .allowedMethods(allowedMethods.split(","))
                .allowedHeaders("*")
                .allowCredentials(allowCredentials)
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Convertir ruta relativa a ruta absoluta para servir archivos estáticos
        // El JAR se ejecuta desde otaku-shop-fullstack/backend/target/otaku-shop-backend-0.1.0.jar
        // Necesitamos: otaku-shop-fullstack/uploads
        String uploadsPath = Paths.get(System.getProperty("user.dir"))
                .getParent()
                .resolve("uploads")
                .toAbsolutePath()
                .toString();
        
        // Si la ruta no existe, intenta con la ruta alternativa
        java.nio.file.Path uploadsDir = Paths.get(uploadsPath);
        if (!java.nio.file.Files.exists(uploadsDir)) {
            // Alternativa: busca desde el directorio actual/uploads
            uploadsPath = Paths.get(System.getProperty("user.dir"))
                    .resolve("uploads")
                    .toAbsolutePath()
                    .toString();
        }
        
        // Mapear /uploads/** a la carpeta de almacenamiento
        // Usar el protocolo file: apropiado para el SO
        String resourceLocation = "file:" + uploadsPath.replace("\\", "/") + "/";
        
        log.info("WebConfig: Sirviendo archivos desde {} con URL: {}", uploadsPath, resourceLocation);
        
        // Registrar el manejador de recursos para /uploads/**
        // Este debe ser accesible sin autenticación
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(resourceLocation)
                .setCachePeriod(3600)
                .resourceChain(true)
                .addResolver(new org.springframework.web.servlet.resource.PathResourceResolver());
        
        // También registrarlo bajo /api/uploads/** para que funcione con el context path
        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations(resourceLocation)
                .setCachePeriod(3600)
                .resourceChain(true)
                .addResolver(new org.springframework.web.servlet.resource.PathResourceResolver());

        log.info("WebConfig: Resource handlers registrados correctamente");
    }
}
