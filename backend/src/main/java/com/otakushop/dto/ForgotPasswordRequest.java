package com.otakushop.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequest {
    
    @NotBlank(message = "El email es requerido")
    @Email(message = "Formato de email inválido")
    private String email;
}
