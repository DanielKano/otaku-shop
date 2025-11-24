package com.otakushop.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para datos de tarjeta de crédito/débito
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDataDTO {

    @NotBlank(message = "El número de tarjeta es obligatorio")
    @Pattern(regexp = "^[0-9]{13,19}$", message = "El número de tarjeta debe tener entre 13 y 19 dígitos")
    private String cardNumber;

    @NotBlank(message = "El titular de la tarjeta es obligatorio")
    @Size(min = 3, max = 100, message = "El nombre del titular debe tener entre 3 y 100 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$", message = "El titular solo puede contener letras y espacios")
    private String cardHolder;

    @NotBlank(message = "La fecha de vencimiento es obligatoria")
    @Pattern(regexp = "^(0[1-9]|1[0-2])/(\\d{2}|\\d{4})$", message = "Formato de fecha inválido (MM/YY o MM/YYYY)")
    private String expiryDate;

    @NotBlank(message = "El CVV es obligatorio")
    @Pattern(regexp = "^\\d{3,4}$", message = "El CVV debe tener 3-4 dígitos")
    private String cvv;
}
