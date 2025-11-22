package com.otakushop.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> rootHome() {
        return getWelcomeResponse();
    }

    @GetMapping("/api")
    public ResponseEntity<Map<String, Object>> apiHome() {
        return getWelcomeResponse();
    }

    @GetMapping("/api/")
    public ResponseEntity<Map<String, Object>> apiSlashHome() {
        return getWelcomeResponse();
    }

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Otaku Shop API");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<Map<String, Object>> getWelcomeResponse() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "¡Bienvenido a Otaku Shop!");
        response.put("version", "1.0.0");
        response.put("status", "API funcionando correctamente");
        response.put("timestamp", System.currentTimeMillis());
        response.put("endpoints", new String[]{
                "POST /api/auth/register - Registrar nuevo usuario",
                "POST /api/auth/login - Iniciar sesión",
                "GET /api/products - Obtener productos",
                "GET /api/products/{id} - Obtener producto por ID",
                "GET /api/health - Estado del servidor"
        });
        return ResponseEntity.ok(response);
    }
}
