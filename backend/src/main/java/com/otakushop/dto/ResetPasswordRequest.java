package com.otakushop.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    
    @NotBlank(message = "El token es requerido")
    private String token;
    
    @NotBlank(message = "La contraseña es requerida")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$", 
             message = "La contraseña debe contener al menos una mayúscula, una minúscula y un número")
    private String newPassword;
}
