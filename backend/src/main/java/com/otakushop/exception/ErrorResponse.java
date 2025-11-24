package com.otakushop.exception;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Response estándar para errores de la API.
 * Evita exponer stack traces al cliente.
 */
@Data
@Builder
public class ErrorResponse {
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
}
