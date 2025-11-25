package com.otakushop.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * ✅ Fase 7: Servicio de almacenamiento local de archivos (DEV)
 * 
 * Guarda archivos en el sistema de archivos local
 * Solo se activa en perfil 'dev' (app.storage.type=local)
 */
@Service
@ConditionalOnProperty(
    name = "app.storage.type",
    havingValue = "local",
    matchIfMissing = true  // Por defecto usar local
)
@RequiredArgsConstructor
@Slf4j
public class LocalStorageService implements StorageService {
    
    @Value("${app.storage.local.base-path:uploads}")
    private String basePath;
    
    @Value("${app.storage.local.image-url-prefix:/images}")
    private String imageUrlPrefix;
    
    /**
     * Carga un archivo localmente
     * 
     * @param file Archivo a cargar
     * @param folder Carpeta dentro de /uploads (ej: 'products', 'users')
     * @return URL relativa del archivo (ej: /images/products/uuid.jpg)
     */
    @Override
    @SuppressWarnings("null")
    public String uploadFile(MultipartFile file, String folder) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("El archivo no puede estar vacío");
        }
        
        try {
            // Crear directorios si no existen
            Path folderPath = Paths.get(basePath, folder);
            Files.createDirectories(folderPath);
            
            // Generar nombre único
            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            String filename = UUID.randomUUID().toString() + fileExtension;
            
            // Guardar archivo
            Path filePath = folderPath.resolve(filename);
            file.transferTo(filePath);
            
            // Retornar URL relativa
            String relativeUrl = imageUrlPrefix + "/" + folder + "/" + filename;
            log.info("Archivo guardado localmente: {}", filePath.toAbsolutePath());
            
            return relativeUrl;
        } catch (IOException e) {
            log.error("Error al guardar archivo localmente", e);
            throw new RuntimeException("Error al guardar archivo: " + e.getMessage(), e);
        }
    }
    
    /**
     * Elimina un archivo local
     * 
     * @param fileUrl URL relativa del archivo (ej: /images/products/uuid.jpg)
     */
    @Override
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }
        
        try {
            // Convertir URL relativa a ruta absoluta
            // /images/products/uuid.jpg -> uploads/products/uuid.jpg
            String relativePath = fileUrl.replace(imageUrlPrefix + "/", "");
            Path filePath = Paths.get(basePath, relativePath);
            
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("Archivo eliminado localmente: {}", filePath.toAbsolutePath());
            } else {
                log.warn("Archivo no encontrado: {}", filePath.toAbsolutePath());
            }
        } catch (IOException e) {
            log.error("Error al eliminar archivo local: {}", fileUrl, e);
            // No lanzar excepción para no impedir operaciones críticas
        }
    }
    
    /**
     * Obtiene la extensión del archivo
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
}
