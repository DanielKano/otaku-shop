package com.otakushop.controller;

import com.otakushop.dto.ProductDTO;
import com.otakushop.dto.ProductRequest;
import com.otakushop.service.ProductService;
import com.otakushop.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowedOrigins}")
public class ProductController {
    private final ProductService productService;
    private final SecurityUtil securityUtil;

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        // Obtener solo productos aprobados (para clientes públicos)
        List<ProductDTO> products = productService.getAllApprovedProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        ProductDTO product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<ProductDTO>> getProductsByCategory(@PathVariable String category) {
        List<ProductDTO> products = productService.getProductsByCategory(category);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductDTO>> searchProducts(@RequestParam String keyword) {
        List<ProductDTO> products = productService.searchProducts(keyword);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/filter")
    public ResponseEntity<List<ProductDTO>> filterProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {
        List<ProductDTO> products = productService.filterProducts(category, minPrice, maxPrice);
        return ResponseEntity.ok(products);
    }

    @PostMapping
    @PreAuthorize("hasRole('VENDEDOR')")
    public ResponseEntity<ProductDTO> createProduct(
            @Valid @RequestBody ProductRequest request) {
        Long vendorId = securityUtil.getCurrentUserId();
        ProductDTO product = productService.createProduct(request, vendorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(product);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('VENDEDOR')")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        Long vendorId = securityUtil.getCurrentUserId();
        ProductDTO product = productService.updateProduct(id, request, vendorId);
        return ResponseEntity.ok(product);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('VENDEDOR')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        Long vendorId = securityUtil.getCurrentUserId();
        productService.deleteProduct(id, vendorId);
        return ResponseEntity.noContent().build();
    }

    // ===== ENDPOINTS DE APROBACIÓN (ADMIN) =====

    /**
     * Obtiene los productos pendientes de aprobación (solo ADMIN)
     */
    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductDTO>> getPendingProducts() {
        List<ProductDTO> products = productService.getPendingProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * Aprueba un producto (solo ADMIN)
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO> approveProduct(@PathVariable Long id) {
        ProductDTO product = productService.approveProduct(id);
        return ResponseEntity.ok(product);
    }

    /**
     * Rechaza un producto (solo ADMIN)
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO> rejectProduct(
            @PathVariable Long id,
            @RequestParam String reason) {
        ProductDTO product = productService.rejectProduct(id, reason);
        return ResponseEntity.ok(product);
    }
}
