package com.otakushop.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/uploads")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class FileUploadController {

    /**
     * Construye la ruta de uploads considerando que el JAR se ejecuta desde backend/target/
     * Necesitamos ir al directorio padre (proyecto raíz) y luego a uploads/images
     */
    private String getUploadPath() {
        String userDir = System.getProperty("user.dir");
        Path uploadsPath = Paths.get(userDir)
                .getParent()
                .resolve("uploads")
                .resolve("images")
                .toAbsolutePath();
        
        // Fallback si no existe (cuando se ejecuta desde otro directorio)
        if (!java.nio.file.Files.exists(uploadsPath)) {
            uploadsPath = Paths.get(userDir)
                    .resolve("uploads")
                    .resolve("images")
                    .toAbsolutePath();
        }
        
        return uploadsPath.toString();
    }

    /**
     * Obtiene una imagen subida por su nombre
     */
    @GetMapping("/images/{fileName}")
    public ResponseEntity<Resource> getImage(@PathVariable String fileName) {
        try {
            String uploadPath = getUploadPath();
            Path filePath = Paths.get(uploadPath).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                                "inline; filename=\"" + fileName + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
