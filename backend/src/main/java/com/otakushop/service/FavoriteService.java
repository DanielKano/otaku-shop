package com.otakushop.service;

import com.otakushop.dto.ProductDTO;
import com.otakushop.entity.Favorite;
import com.otakushop.entity.Product;
import com.otakushop.entity.User;
import com.otakushop.repository.FavoriteRepository;
import com.otakushop.repository.ProductRepository;
import com.otakushop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    /**
     * Obtiene todos los favoritos de un usuario
     */
    @Transactional(readOnly = true)
    public List<ProductDTO> getFavoritesByUserId(Long userId) {
        List<Favorite> favorites = favoriteRepository.findByUserId(userId);
        return favorites.stream()
                .map(fav -> convertToDTO(fav.getProduct()))
                .collect(Collectors.toList());
    }

    /**
     * Agrega un producto a favoritos
     */
    @Transactional
    public void addFavorite(Long userId, Long productId) {
        // Verificar si ya existe
        if (favoriteRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new RuntimeException("El producto ya está en favoritos");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Favorite favorite = Favorite.builder()
                .user(user)
                .product(product)
                .build();
        favoriteRepository.save(favorite);
    }

    /**
     * Elimina un producto de favoritos
     */
    @Transactional
    public void removeFavorite(Long userId, Long productId) {
        favoriteRepository.deleteByUserIdAndProductId(userId, productId);
    }

    /**
     * Verifica si un producto está en favoritos
     */
    @Transactional(readOnly = true)
    public boolean isFavorite(Long userId, Long productId) {
        return favoriteRepository.existsByUserIdAndProductId(userId, productId);
    }

    /**
     * Cuenta los favoritos de un usuario
     */
    @Transactional(readOnly = true)
    public long countFavorites(Long userId) {
        return favoriteRepository.countByUserId(userId);
    }

    /**
     * Convierte Product a ProductDTO
     */
    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStock(product.getStock());
        dto.setCategory(product.getCategory());
        dto.setImageUrl(product.getImageUrl());
        dto.setStatus(product.getStatus() != null ? product.getStatus().name() : null);
        
        if (product.getVendor() != null) {
            dto.setVendorId(product.getVendor().getId());
        }
        
        return dto;
    }
}
