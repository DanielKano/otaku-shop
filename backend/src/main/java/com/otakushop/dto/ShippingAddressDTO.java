package com.otakushop.dto;

import com.otakushop.validation.ValidDepartment;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para dirección de envío
 * Validaciones para contexto colombiano
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingAddressDTO {

    @NotBlank(message = "La dirección es obligatoria")
    @Size(min = 10, max = 200, message = "La dirección debe tener entre 10 y 200 caracteres")
    private String street;

    @NotBlank(message = "La ciudad es obligatoria")
    @Size(min = 3, max = 50, message = "La ciudad debe tener entre 3 y 50 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$", message = "La ciudad solo puede contener letras")
    private String city;

    @NotBlank(message = "El departamento es obligatorio")
    @ValidDepartment
    private String department;

    @NotBlank(message = "El código postal es obligatorio")
    @Pattern(regexp = "^\\d{6}$", message = "El código postal debe tener exactamente 6 dígitos")
    private String postalCode;

    private String additionalInfo;
}
