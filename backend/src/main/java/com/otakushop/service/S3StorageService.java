package com.otakushop.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.core.sync.RequestBody;

import java.io.IOException;
import java.util.UUID;

/**
 * ✅ Fase 7: Servicio de almacenamiento en AWS S3 (PROD)
 * 
 * Carga y elimina archivos en bucket S3
 * Solo se activa en perfil 'prod' (app.storage.type=s3)
 * 
 * Dependencias requeridas:
 * - software.amazon.awssdk:s3:2.20.x
 */
@Service
@ConditionalOnProperty(
    name = "app.storage.type",
    havingValue = "s3"
)
@RequiredArgsConstructor
@Slf4j
public class S3StorageService implements StorageService {
    
    private final S3Client s3Client;
    
    @Value("${aws.s3.bucket-name}")
    private String bucketName;
    
    @Value("${aws.s3.region:us-east-1}")
    private String region;
    
    @Value("${aws.s3.url:https://s3.amazonaws.com}")
    private String s3Url;
    
    /**
     * Carga un archivo en S3
     * 
     * @param file Archivo a cargar
     * @param folder Carpeta dentro del bucket (ej: 'products', 'users')
     * @return URL pública del archivo
     */
    @Override
    public String uploadFile(MultipartFile file, String folder) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("El archivo no puede estar vacío");
        }
        
        try {
            // Generar nombre único
            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            String filename = folder + "/" + UUID.randomUUID().toString() + fileExtension;
            
            // Subir a S3
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(filename)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();
            
            s3Client.putObject(
                    putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize())
            );
            
            // Construir URL pública
            String fileUrl = String.format("%s/%s/%s", s3Url, bucketName, filename);
            log.info("Archivo cargado a S3: {}", fileUrl);
            
            return fileUrl;
        } catch (IOException e) {
            log.error("Error al cargar archivo a S3", e);
            throw new RuntimeException("Error al cargar archivo: " + e.getMessage(), e);
        }
    }
    
    /**
     * Elimina un archivo de S3
     * 
     * @param fileUrl URL del archivo a eliminar
     */
    @Override
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }
        
        try {
            // Extraer key del fileUrl: https://s3.amazonaws.com/bucket/products/uuid.jpg -> products/uuid.jpg
            String key = extractKeyFromUrl(fileUrl);
            
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();
            
            s3Client.deleteObject(deleteObjectRequest);
            log.info("Archivo eliminado de S3: {}", fileUrl);
        } catch (Exception e) {
            log.error("Error al eliminar archivo de S3: {}", fileUrl, e);
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
    
    /**
     * Extrae la key del S3 a partir de la URL pública
     */
    private String extractKeyFromUrl(String fileUrl) {
        // Formato esperado: https://s3.amazonaws.com/bucket-name/key
        String[] parts = fileUrl.split("/");
        if (parts.length < 4) {
            throw new IllegalArgumentException("URL inválida: " + fileUrl);
        }
        return String.join("/", java.util.Arrays.copyOfRange(parts, 4, parts.length));
    }
}
