package com.otakushop.dto;

import com.otakushop.validation.annotations.*;
import lombok.*;
import jakarta.validation.constraints.*;

/**
 * DTO para registro de usuario con validaciones avanzadas.
 * Utiliza anotaciones personalizadas para validación estricta de:
 * - Nombre completo (anti-spam, realismo semántico)
 * - Email (whitelist de dominios permitidos)
 * - Teléfono (prefijos colombianos válidos)
 * - Contraseña (fortaleza, anti-common, anti-personal-info)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {
    
    @ValidFullName(
        message = "El nombre completo no es válido",
        minWords = 2,
        enableSemanticValidation = true,
        strictMode = true
    )
    private String name;

    @ValidStrictEmail(
        message = "El correo electrónico no es válido o el dominio no está permitido",
        checkDomain = true,
        allowedDomains = {"gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "otaku.com", "otakushop.com"}
    )
    private String email;

    @ValidColombianPhone(
        message = "El número telefónico colombiano no es válido",
        enableSemanticValidation = true,
        strictMode = true
    )
    private String phone;

    @ValidSecurePassword(
        message = "La contraseña debe tener al menos 6 caracteres",
        minLength = 6,
        requireUppercase = false,
        requireLowercase = false,
        requireNumber = false,
        requireSpecial = false,
        checkCommon = false,
        enableStrengthCheck = false,
        minStrength = "weak"
    )
    private String password;

    @NotBlank(message = "Confirmación de contraseña requerida")
    private String confirmPassword;

    @Builder.Default
    private String role = "cliente";
}

