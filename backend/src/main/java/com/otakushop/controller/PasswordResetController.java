package com.otakushop.controller;

import com.otakushop.dto.ForgotPasswordRequest;
import com.otakushop.dto.ResetPasswordRequest;
import com.otakushop.service.PasswordResetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Endpoints de autenticación y recuperación de contraseña")
public class PasswordResetController {
    
    private final PasswordResetService passwordResetService;
    
    @PostMapping("/forgot-password")
    @Operation(summary = "Solicitar recuperación de contraseña")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.createPasswordResetToken(request.getEmail());
        return ResponseEntity.ok(Map.of(
            "message", "Si el email existe, recibirás instrucciones para restablecer tu contraseña"
        ));
    }
    
    @PostMapping("/reset-password")
    @Operation(summary = "Restablecer contraseña con token")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(Map.of(
            "message", "Contraseña restablecida exitosamente"
        ));
    }
    
    @GetMapping("/validate-reset-token")
    @Operation(summary = "Validar token de recuperación")
    public ResponseEntity<?> validateResetToken(@RequestParam String token) {
        boolean valid = passwordResetService.validateToken(token);
        return ResponseEntity.ok(Map.of(
            "valid", valid
        ));
    }
}
