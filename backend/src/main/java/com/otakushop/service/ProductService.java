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
                .filter(p -> "APPROVED".equals(p.getStatus()) && p.getActive())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene los productos pendientes de aprobación
     */
    public List<ProductDTO> getPendingProducts() {
        return productRepository.findAll().stream()
                .filter(p -> "PENDING".equals(p.getStatus()) && p.getActive())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Aprueba un producto (cambiar estado a APPROVED)
     */
    @Transactional
    public ProductDTO approveProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        if (!"PENDING".equals(product.getStatus())) {
            throw new RuntimeException("Solo se pueden aprobar productos en estado PENDING");
        }
        
        product.setStatus("APPROVED");
        product.setApprovedAt(java.time.LocalDateTime.now());
        Product savedProduct = productRepository.save(product);
        return convertToDTO(savedProduct);
    }

    /**
     * Rechaza un producto (cambiar estado a REJECTED)
     */
    @Transactional
    public ProductDTO rejectProduct(Long productId, String reason) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        if (!"PENDING".equals(product.getStatus())) {
            throw new RuntimeException("Solo se pueden rechazar productos en estado PENDING");
        }
        
        product.setStatus("REJECTED");
        product.setRejectionReason(reason);
        product.setApprovedAt(java.time.LocalDateTime.now());
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
                .active(request.getActive())
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
        product.setActive(request.getActive());

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
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
