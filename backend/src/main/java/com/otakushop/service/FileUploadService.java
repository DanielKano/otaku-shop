package com.otakushop.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j
public class FileUploadService {

    // Usar ruta absoluta como fallback
    private static final String DEFAULT_UPLOAD_PATH = System.getProperty("user.dir") + "/uploads/images";

    private static final Set<String> ALLOWED_EXTENSIONS = new HashSet<>(Arrays.asList(
        "jpg", "jpeg", "png", "webp", "gif", "bmp"
    ));

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    /**
     * Sube un archivo de imagen y retorna la ruta de acceso
     */
    public String uploadImage(MultipartFile file) throws IOException {
        // Validar que el archivo no sea null
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo no puede estar vacío");
        }

        // Validar tamaño
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("El archivo excede el tamaño máximo de 5MB");
        }

        // Validar extensión
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null) {
            throw new IllegalArgumentException("El nombre del archivo no es válido");
        }

        String fileExtension = getFileExtension(originalFileName).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(fileExtension)) {
            throw new IllegalArgumentException(
                "Extensión de archivo no permitida. Extensiones válidas: " + ALLOWED_EXTENSIONS
            );
        }

        // Usar ruta absoluta
        Path uploadDir = Paths.get(DEFAULT_UPLOAD_PATH).toAbsolutePath();
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
            log.info("Directorio de carga creado: {}", uploadDir);
        }

        // Generar nombre único para el archivo
        String uniqueFileName = UUID.randomUUID().toString() + "." + fileExtension;
        Path filePath = uploadDir.resolve(uniqueFileName);

        // Guardar archivo
        file.transferTo(filePath.toFile());
        log.info("Archivo subido exitosamente: {} en {}", uniqueFileName, filePath);

        // Retornar solo el nombre (no la ruta)
        return uniqueFileName;
    }

    /**
     * Obtiene la extensión de archivo
     */
    private String getFileExtension(String fileName) {
        int lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < fileName.length() - 1) {
            return fileName.substring(lastDotIndex + 1);
        }
        return "";
    }

    /**
     * Elimina un archivo por nombre
     */
    public void deleteImage(String fileName) {
        try {
            Path filePath = Paths.get(DEFAULT_UPLOAD_PATH).resolve(fileName).toAbsolutePath();
            Files.deleteIfExists(filePath);
            log.info("Archivo eliminado: {}", fileName);
        } catch (IOException e) {
            log.error("Error al eliminar archivo: {}", fileName, e);
        }
    }

    /**
     * Obtiene la ruta completa del archivo para servir
     */
    public String getFilePath(String fileName) {
        return DEFAULT_UPLOAD_PATH + "/" + fileName;
    }
}
