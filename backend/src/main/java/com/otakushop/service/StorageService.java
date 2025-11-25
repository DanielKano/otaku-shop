package com.otakushop.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * ✅ Fase 7: Interfaz para servicios de almacenamiento
 * 
 * Abstracción que permite usar local storage (dev) o S3 (prod)
 * La implementación se inyecta automáticamente según el perfil
 */
public interface StorageService {
    
    /**
     * Carga un archivo
     * 
     * @param file Archivo a cargar
     * @param folder Carpeta/categoría dentro del almacenamiento
     * @return URL del archivo cargado
     */
    String uploadFile(MultipartFile file, String folder);
    
    /**
     * Elimina un archivo
     * 
     * @param fileUrl URL o ruta del archivo a eliminar
     */
    void deleteFile(String fileUrl);
}
