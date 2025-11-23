package com.otakushop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRejectionRequest {
    
    @NotBlank(message = "La razón del rechazo es requerida")
    private String reason;
}
