package com.otakushop.service;

import com.otakushop.dto.ProductDTO;
import com.otakushop.dto.ProductRequest;
import com.otakushop.entity.Product;
import com.otakushop.entity.User;
import com.otakushop.repository.ProductRepository;
import com.otakushop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene solo los productos aprobados (visibles para clientes)
     */
    public List<ProductDTO> getAllApprovedProducts() {
        return productRepository.findAll().stream()
                .filter(p -> "APPROVED".equals(p.getStatus()) && 
                           (p.getActive() != null && p.getActive()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene los productos pendientes de aprobación
     */
    public List<ProductDTO> getPendingProducts() {
        return productRepository.findAll().stream()
                .filter(p -> "PENDING".equals(p.getStatus()) && 
                           (p.getActive() != null && p.getActive()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Aprueba un producto (cambiar estado a APPROVED)
     */
    @Transactional
    public ProductDTO approveProduct(Long productId, Long adminId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        if (!"PENDING".equals(product.getStatus())) {
            throw new RuntimeException("Solo se pueden aprobar productos en estado PENDING");
        }
        
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin no encontrado"));
        
        product.setStatus("APPROVED");
        product.setApprovedAt(java.time.LocalDateTime.now());
        product.setApprovedBy(admin);
        Product savedProduct = productRepository.save(product);
        return convertToDTO(savedProduct);
    }

    /**
     * Rechaza un producto (cambiar estado a REJECTED)
     */
    @Transactional
    public ProductDTO rejectProduct(Long productId, String reason, Long adminId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        if (!"PENDING".equals(product.getStatus())) {
            throw new RuntimeException("Solo se pueden rechazar productos en estado PENDING");
        }
        
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin no encontrado"));
        
        product.setStatus("REJECTED");
        product.setRejectionReason(reason);
        product.setApprovedAt(java.time.LocalDateTime.now());
        product.setApprovedBy(admin);
        Product savedProduct = productRepository.save(product);
        return convertToDTO(savedProduct);
    }

    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        return convertToDTO(product);
    }

    public List<ProductDTO> getProductsByCategory(String category) {
        return productRepository.findByCategory(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> searchProducts(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> filterProducts(String category, BigDecimal minPrice, BigDecimal maxPrice) {
        return productRepository.findByFilters(category, minPrice, maxPrice).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDTO createProduct(ProductRequest request, Long vendorId) {
        User vendor = userRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendedor no encontrado"));

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .originalPrice(request.getOriginalPrice())
                .category(request.getCategory())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl())
                .vendor(vendor)
                .active(request.getActive() != null ? request.getActive() : true)  // Default to true if null
                .build();

        product = productRepository.save(product);
        return convertToDTO(product);
    }

    @Transactional
    public ProductDTO updateProduct(Long id, ProductRequest request, Long vendorId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (!product.getVendor().getId().equals(vendorId)) {
            throw new RuntimeException("No tienes permiso para actualizar este producto");
        }

        // ✅ VALIDACIÓN: Solo se pueden editar productos en estado PENDING
        if (!"PENDING".equals(product.getStatus())) {
            throw new IllegalArgumentException("No se pueden editar productos que ya han sido aprobados o rechazados");
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setOriginalPrice(request.getOriginalPrice());
        product.setCategory(request.getCategory());
        product.setStock(request.getStock());
        product.setImageUrl(request.getImageUrl());
        if (request.getActive() != null) {
            product.setActive(request.getActive());
        }

        product = productRepository.save(product);
        return convertToDTO(product);
    }

    @Transactional
    public void deleteProduct(Long id, Long vendorId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (!product.getVendor().getId().equals(vendorId)) {
            throw new RuntimeException("No tienes permiso para eliminar este producto");
        }

        // ✅ SOFT DELETE: Marcar como inactivo y cambiar estado
        product.setActive(false);
        product.setStatus("DELETED");
        productRepository.save(product);
    }

    /**
     * Obtiene los productos de un vendedor específico, filtrando por estado
     * Estados válidos: PENDING, APPROVED, REJECTED, CANCELLED, DELETED
     */
    public List<ProductDTO> getProductsByVendorAndStatus(Long vendorId, String status) {
        return productRepository.findAll().stream()
                .filter(p -> p.getVendor().getId().equals(vendorId))
                .filter(p -> p.getStatus() != null && p.getStatus().equals(status))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene todos los productos de un vendedor específico
     */
    public List<ProductDTO> getProductsByVendor(Long vendorId) {
        return productRepository.findAll().stream()
                .filter(p -> p.getVendor().getId().equals(vendorId))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Cancela un producto (cambiar estado a CANCELLED)
     * Solo se puede cancelar si está en estado PENDING o APPROVED
     */
    @Transactional
    public ProductDTO cancelProduct(Long productId, Long vendorId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (!product.getVendor().getId().equals(vendorId)) {
            throw new RuntimeException("No tienes permiso para cancelar este producto");
        }

        String currentStatus = product.getStatus();
        if (!("PENDING".equals(currentStatus) || "APPROVED".equals(currentStatus))) {
            throw new IllegalArgumentException(
                "No se puede cancelar un producto en estado " + currentStatus + 
                ". Solo se pueden cancelar productos PENDING o APPROVED"
            );
        }

        product.setStatus("CANCELLED");
        product.setActive(false);
        product.setUpdatedAt(java.time.LocalDateTime.now());
        Product savedProduct = productRepository.save(product);
        return convertToDTO(savedProduct);
    }

    private ProductDTO convertToDTO(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .originalPrice(product.getOriginalPrice())
                .category(product.getCategory())
                .stock(product.getStock())
                .imageUrl(product.getImageUrl())
                .rating(product.getRating())
                .reviews(product.getReviews())
                .vendorId(product.getVendor().getId())
                .active(product.getActive())
                .status(product.getStatus())  // Add status mapping
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
