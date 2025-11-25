package com.otakushop.service;

import com.otakushop.dto.ProductDTO;
import com.otakushop.dto.ProductRequest;
import com.otakushop.entity.Product;
import com.otakushop.entity.ProductStatus;
import com.otakushop.entity.User;
import com.otakushop.repository.ProductRepository;
import com.otakushop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final FileUploadService fileUploadService;

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
                .filter(p -> ProductStatus.PENDING.equals(p.getStatus()) && 
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
        
        if (!com.otakushop.entity.ProductStatus.PENDING.equals(product.getStatus())) {
            throw new RuntimeException("Solo se pueden aprobar productos pendientes");
        }
        
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin no encontrado"));
        
        product.setStatus(com.otakushop.entity.ProductStatus.APPROVED);
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
        
        if (!com.otakushop.entity.ProductStatus.PENDING.equals(product.getStatus())) {
            throw new RuntimeException("Solo se pueden rechazar productos en estado PENDING");
        }
        
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin no encontrado"));
        
        product.setStatus(com.otakushop.entity.ProductStatus.REJECTED);
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

    /**
     * Filtra productos aprobados con búsqueda, categoría y rango de precio
     */
    public List<ProductDTO> filterApprovedProducts(String search, String category, BigDecimal minPrice, BigDecimal maxPrice) {
        return productRepository.findAll().stream()
                .filter(p -> "APPROVED".equals(p.getStatus()) && (p.getActive() != null && p.getActive()))
                .filter(p -> search == null || search.isEmpty() || 
                           p.getName().toLowerCase().contains(search.toLowerCase()) ||
                           (p.getDescription() != null && p.getDescription().toLowerCase().contains(search.toLowerCase())))
                .filter(p -> category == null || category.isEmpty() || category.equals(p.getCategory()))
                .filter(p -> minPrice == null || p.getPrice().compareTo(minPrice) >= 0)
                .filter(p -> maxPrice == null || p.getPrice().compareTo(maxPrice) <= 0)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDTO createProduct(ProductRequest request, Long vendorId) {
        User vendor = userRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendedor no encontrado"));

        // Procesar imagen si viene
        String imageUrl = null;
        if (request.getImageFile() != null && !request.getImageFile().isEmpty()) {
            try {
                imageUrl = fileUploadService.uploadImage(request.getImageFile());
            } catch (IOException e) {
                log.error("Error al subir imagen", e);
                throw new RuntimeException("Error al subir imagen: " + e.getMessage());
            }
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .originalPrice(request.getOriginalPrice())
                .category(request.getCategory())
                .stock(request.getStock())
                .imageUrl(imageUrl)
                .vendor(vendor)
                .active(request.getActive() != null ? request.getActive() : true)
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
        if (!ProductStatus.PENDING.equals(product.getStatus())) {
            throw new IllegalArgumentException("No se pueden editar productos que ya han sido aprobados o rechazados");
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setOriginalPrice(request.getOriginalPrice());
        product.setCategory(request.getCategory());
        product.setStock(request.getStock());
        
        // Procesar nueva imagen si viene
        if (request.getImageFile() != null && !request.getImageFile().isEmpty()) {
            try {
                // Eliminar imagen anterior si existe
                if (product.getImageUrl() != null) {
                    fileUploadService.deleteImage(product.getImageUrl());
                }
                // Subir nueva imagen
                String newImageUrl = fileUploadService.uploadImage(request.getImageFile());
                product.setImageUrl(newImageUrl);
            } catch (IOException e) {
                log.error("Error al actualizar imagen", e);
                throw new RuntimeException("Error al actualizar imagen: " + e.getMessage());
            }
        }
        
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

        // ✅ SOFT DELETE: Marcar como inactivo y cambiar estado a REJECTED
        product.setActive(false);
        product.setStatus(ProductStatus.REJECTED);  // REJECTED representa eliminado/rechazado
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

        ProductStatus currentStatus = product.getStatus();
        if (!(ProductStatus.PENDING.equals(currentStatus) || ProductStatus.APPROVED.equals(currentStatus))) {
            throw new IllegalArgumentException(
                "No se puede cancelar un producto en estado " + currentStatus + 
                ". Solo se pueden cancelar productos PENDING o APPROVED"
            );
        }

        product.setStatus(ProductStatus.REJECTED);  // REJECTED representa cancelado/rechazado
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
                .status(product.getStatus() != null ? product.getStatus().name() : null)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
