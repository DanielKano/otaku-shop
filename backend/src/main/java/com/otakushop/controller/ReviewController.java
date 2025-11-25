package com.otakushop.controller;

import com.otakushop.dto.ProductRatingStats;
import com.otakushop.dto.ReviewRequest;
import com.otakushop.dto.ReviewResponse;
import com.otakushop.security.CurrentUser;
import com.otakushop.security.UserPrincipal;
import com.otakushop.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Gestión de reseñas y calificaciones de productos")
public class ReviewController {
    
    private final ReviewService reviewService;
    
    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Crear nueva reseña")
    public ResponseEntity<ReviewResponse> createReview(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody ReviewRequest request) {
        ReviewResponse review = reviewService.createReview(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }
    
    @PutMapping("/{reviewId}")
    @PreAuthorize("hasRole('CLIENT')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Actualizar reseña existente")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long reviewId,
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody ReviewRequest request) {
        ReviewResponse review = reviewService.updateReview(reviewId, currentUser.getId(), request);
        return ResponseEntity.ok(review);
    }
    
    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasRole('CLIENT')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Eliminar reseña")
    public ResponseEntity<?> deleteReview(
            @PathVariable Long reviewId,
            @CurrentUser UserPrincipal currentUser) {
        reviewService.deleteReview(reviewId, currentUser.getId());
        return ResponseEntity.ok(Map.of("message", "Reseña eliminada exitosamente"));
    }
    
    @GetMapping("/product/{productId}")
    @Operation(summary = "Obtener reseñas de un producto")
    public ResponseEntity<Page<ReviewResponse>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ReviewResponse> reviews = reviewService.getProductReviews(productId, page, size);
        return ResponseEntity.ok(reviews);
    }
    
    @GetMapping("/user/my-reviews")
    @PreAuthorize("hasRole('CLIENT')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Obtener mis reseñas")
    public ResponseEntity<Page<ReviewResponse>> getMyReviews(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ReviewResponse> reviews = reviewService.getUserReviews(currentUser.getId(), page, size);
        return ResponseEntity.ok(reviews);
    }
    
    @GetMapping("/product/{productId}/stats")
    @Operation(summary = "Obtener estadísticas de calificaciones de un producto")
    public ResponseEntity<ProductRatingStats> getProductRatingStats(@PathVariable Long productId) {
        ProductRatingStats stats = reviewService.getProductRatingStats(productId);
        return ResponseEntity.ok(stats);
    }
    
    @PostMapping("/{reviewId}/vendor-response")
    @PreAuthorize("hasRole('VENDOR')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Agregar respuesta del vendedor a una reseña")
    public ResponseEntity<ReviewResponse> addVendorResponse(
            @PathVariable Long reviewId,
            @CurrentUser UserPrincipal currentUser,
            @RequestBody Map<String, String> request) {
        ReviewResponse review = reviewService.addVendorResponse(
            reviewId, 
            currentUser.getId(), 
            request.get("response")
        );
        return ResponseEntity.ok(review);
    }
}
