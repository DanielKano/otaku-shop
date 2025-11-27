package com.otakushop.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${cors.allowedOrigins}")
public class UploadController {
    
    @Value("${file.upload-dir:uploads/images}")
    private String uploadDir;

    @Value("${server.domain:http://localhost:8080}")
    private String serverDomain;

    /**
     * Sube una imagen de producto
     * Autenticado: Solo usuarios registrados (VENDEDOR, ADMIN, etc.)
     */
    @PostMapping("/image")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            // Validar que el archivo no esté vacío
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "El archivo está vacío")
                );
            }

            // Validar tipo de contenido
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Solo se permiten imágenes (JPG, PNG, GIF, WebP)")
                );
            }

            // Validar tamaño máximo (5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "La imagen no puede superar 5MB")
                );
            }

            // Generar nombre único con timestamp
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.isEmpty()) {
                return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", "Nombre de archivo inválido"));
            }
            
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = System.currentTimeMillis() + "_" + 
                            (int)(Math.random() * 10000) + extension;

            // Crear ruta de almacenamiento
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            
            // Crear directorio si no existe
            Files.createDirectories(uploadPath);
            
            // Guardar archivo
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            // Retornar URL completa (con dominio)
            String imageUrl = serverDomain + "/uploads/images/" + filename;

            Map<String, String> response = new HashMap<>();
            response.put("url", imageUrl);
            response.put("filename", filename);

            log.debug("Imagen guardada: {}", filePath);

            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            log.error("Error al guardar imagen: {}", e.getMessage());
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error al guardar la imagen: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error inesperado: {}", e.getMessage());
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error inesperado al procesar la imagen"));
        }
    }

    /**
     * Acepta una URL de imagen y la valida
     * Autenticado: Solo usuarios registrados (VENDEDOR, ADMIN, etc.)
     */
    @PostMapping("/image-url")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadImageUrl(@RequestParam("url") String imageUrl) {
        try {
            // Validar que la URL no esté vacía
            if (imageUrl == null || imageUrl.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "La URL de la imagen no puede estar vacía")
                );
            }

            // Validar que la URL apunte a una imagen
            if (!imageUrl.matches(".*\\.(jpg|jpeg|png|gif|webp)$")) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "La URL debe apuntar a una imagen válida (JPG, PNG, GIF, WebP)")
                );
            }

            // Retornar la URL para guardar en la base de datos
            Map<String, String> response = new HashMap<>();
            response.put("url", imageUrl);

            log.debug("URL de imagen aceptada: {}", imageUrl);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error al procesar la URL de la imagen: {}", e.getMessage());
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error inesperado al procesar la URL de la imagen"));
        }
    }
}
