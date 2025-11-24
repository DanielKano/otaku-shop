package com.otakushop.controller;

import com.otakushop.dto.ProductDTO;
import com.otakushop.dto.ProductRequest;
import com.otakushop.service.ProductService;
import com.otakushop.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowedOrigins}")
@Slf4j
public class ProductController {
    private final ProductService productService;
    private final SecurityUtil securityUtil;

    // ===== ENDPOINTS DE APROBACIÓN (ADMIN) - DEBEN VENIR PRIMERO =====

    /**
     * Obtiene los productos pendientes de aprobación (solo ADMIN)
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductDTO>> getPendingProducts() {
        List<ProductDTO> products = productService.getPendingProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * Obtiene todos los productos aprobados y activos (solo ADMIN)
     */
    @GetMapping("/approved")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductDTO>> getApprovedProducts() {
        List<ProductDTO> products = productService.getAllApprovedProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * Aprueba un producto (solo ADMIN)
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO> approveProduct(
            @PathVariable Long id,
            @RequestBody(required = false) String rejectionReason) {
        Long adminId = securityUtil.getCurrentUserId();
        ProductDTO product = productService.approveProduct(id, adminId);
        return ResponseEntity.ok(product);
    }

    /**
     * Rechaza un producto (solo ADMIN)
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO> rejectProduct(
            @PathVariable Long id,
            @RequestBody String rejectionReason) {
        Long adminId = securityUtil.getCurrentUserId();
        ProductDTO product = productService.rejectProduct(id, rejectionReason, adminId);
        return ResponseEntity.ok(product);
    }

    // ===== ENDPOINTS GENERALES =====

    @GetMapping
    public ResponseEntity<?> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit) {
        
        // Filtrar productos aprobados con todos los parámetros
        List<ProductDTO> filteredProducts = productService.filterApprovedProducts(
            search, category, minPrice, maxPrice
        );
        
        // Paginación manual
        int start = (page - 1) * limit;
        int end = Math.min(start + limit, filteredProducts.size());
        List<ProductDTO> paginatedProducts = start < filteredProducts.size() 
            ? filteredProducts.subList(start, end) 
            : List.of();
        
        int totalPages = (int) Math.ceil((double) filteredProducts.size() / limit);
        
        // Retornar con estructura esperada por frontend
        Map<String, Object> response = new HashMap<>();
        response.put("products", paginatedProducts);
        response.put("pages", totalPages);
        response.put("total", filteredProducts.size());
        response.put("currentPage", page);
        return ResponseEntity.ok(response);
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

    /**
     * Obtiene los productos del vendedor actual, opcionalmente filtrados por estado
     * Estados: PENDING, APPROVED, REJECTED, CANCELLED, DELETED
     */
    @GetMapping("/myproducts")
    @PreAuthorize("hasRole('VENDEDOR')")
    public ResponseEntity<?> getMyProducts(
            @RequestParam(required = false) String status) {
        Long vendorId = securityUtil.getCurrentUserId();
        List<ProductDTO> products;

        if (status != null && !status.isEmpty()) {
            products = productService.getProductsByVendorAndStatus(vendorId, status);
        } else {
            products = productService.getProductsByVendor(vendorId);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("products", products);
        response.put("count", products.size());
        response.put("status", status != null ? status : "ALL");
        return ResponseEntity.ok(response);
    }

    /**
     * Cancela un producto del vendedor
     * Solo se puede cancelar si está en estado PENDING o APPROVED
     */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('VENDEDOR')")
    public ResponseEntity<ProductDTO> cancelProduct(@PathVariable Long id) {
        Long vendorId = securityUtil.getCurrentUserId();
        ProductDTO product = productService.cancelProduct(id, vendorId);
        return ResponseEntity.ok(product);
    }

    // Debug endpoint to check all products in database
    @GetMapping("/debug/all")
    public ResponseEntity<?> debugAllProducts() {
        List<ProductDTO> all = productService.getAllProducts();
        Map<String, Object> debug = new HashMap<>();
        debug.put("totalProducts", all.size());
        debug.put("products", all);
        
        log.debug("=== DEBUG ALL PRODUCTS ===");
        for (ProductDTO p : all) {
            log.debug("Product: {} | ID: {} | Status: {} | Active: {}", 
                    p.getName(), p.getId(), p.getStatus(), p.getActive());
        }
        log.debug("========================");
        
        return ResponseEntity.ok(debug);
    }
}
