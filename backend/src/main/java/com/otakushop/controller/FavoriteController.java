package com.otakushop.controller;

import com.otakushop.dto.ProductDTO;
import com.otakushop.entity.User;
import com.otakushop.repository.UserRepository;
import com.otakushop.service.FavoriteService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/favorites")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;
    
    @Autowired
    private UserRepository userRepository;

    /**
     * Obtiene todos los favoritos del usuario actual
     */
    @GetMapping
    public ResponseEntity<List<ProductDTO>> getFavorites(@AuthenticationPrincipal UserDetails userDetails) {
        log.debug("GET /favorites - User: {}", userDetails != null ? userDetails.getUsername() : "null");
        
        if (userDetails == null) {
            log.warn("GET /favorites - No authenticated user");
            return ResponseEntity.status(401).build();
        }
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        List<ProductDTO> favorites = favoriteService.getFavoritesByUserId(user.getId());
        log.debug("GET /favorites - Found {} favorites for user {}", favorites.size(), user.getEmail());
        return ResponseEntity.ok(favorites);
    }

    /**
     * Agrega un producto a favoritos
     */
    @PostMapping("/{productId}")
    public ResponseEntity<Map<String, String>> addFavorite(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId) {
        log.debug("POST /favorites/{} - User: {}", productId, userDetails != null ? userDetails.getUsername() : "null");
        
        if (userDetails == null) {
            log.warn("POST /favorites/{} - No authenticated user", productId);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Debes iniciar sesión para agregar favoritos");
            return ResponseEntity.status(401).body(error);
        }
        
        try {
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            favoriteService.addFavorite(user.getId(), productId);
            log.info("Favorite added - User: {}, Product: {}", user.getEmail(), productId);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Producto agregado a favoritos");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error adding favorite - Product: {}, Error: {}", productId, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Elimina un producto de favoritos
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<Map<String, String>> removeFavorite(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId) {
        log.debug("DELETE /favorites/{} - User: {}", productId, userDetails != null ? userDetails.getUsername() : "null");
        
        if (userDetails == null) {
            log.warn("DELETE /favorites/{} - No authenticated user", productId);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Debes iniciar sesión para gestionar favoritos");
            return ResponseEntity.status(401).body(error);
        }
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        favoriteService.removeFavorite(user.getId(), productId);
        log.info("Favorite removed - User: {}, Product: {}", user.getEmail(), productId);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Producto eliminado de favoritos");
        return ResponseEntity.ok(response);
    }

    /**
     * Verifica si un producto está en favoritos
     */
    @GetMapping("/check/{productId}")
    public ResponseEntity<Map<String, Boolean>> isFavorite(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId) {
        // Si el usuario no está autenticado, retornar false
        if (userDetails == null) {
            Map<String, Boolean> response = new HashMap<>();
            response.put("isFavorite", false);
            return ResponseEntity.ok(response);
        }
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        boolean isFavorite = favoriteService.isFavorite(user.getId(), productId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("isFavorite", isFavorite);
        return ResponseEntity.ok(response);
    }

    /**
     * Cuenta los favoritos del usuario
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> countFavorites(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            Map<String, Long> response = new HashMap<>();
            response.put("count", 0L);
            return ResponseEntity.ok(response);
        }
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        long count = favoriteService.countFavorites(user.getId());
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }
}
