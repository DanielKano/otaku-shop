package com.otakushop.repository;

import com.otakushop.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    /**
     * Encuentra todos los favoritos de un usuario
     */
    @Query("SELECT f FROM Favorite f JOIN FETCH f.product WHERE f.user.id = :userId")
    List<Favorite> findByUserId(@Param("userId") Long userId);

    /**
     * Verifica si un producto está en favoritos de un usuario
     */
    @Query("SELECT COUNT(f) > 0 FROM Favorite f WHERE f.user.id = :userId AND f.product.id = :productId")
    boolean existsByUserIdAndProductId(@Param("userId") Long userId, @Param("productId") Long productId);

    /**
     * Encuentra un favorito específico de un usuario
     */
    Optional<Favorite> findByUserIdAndProductId(Long userId, Long productId);

    /**
     * Elimina un favorito por usuario y producto
     */
    void deleteByUserIdAndProductId(Long userId, Long productId);

    /**
     * Cuenta los favoritos de un usuario
     */
    long countByUserId(Long userId);
}
