package com.otakushop.repository;

import com.otakushop.entity.Review;
import com.otakushop.entity.Product;
import com.otakushop.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    Page<Review> findByProductId(Long productId, Pageable pageable);
    
    Page<Review> findByUserId(Long userId, Pageable pageable);
    
    Optional<Review> findByProductIdAndUserId(Long productId, Long userId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Double getAverageRatingByProductId(@Param("productId") Long productId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId")
    Long countByProductId(@Param("productId") Long productId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId AND r.rating = :rating")
    Long countByProductIdAndRating(@Param("productId") Long productId, @Param("rating") Integer rating);
    
    boolean existsByProductIdAndUserId(Long productId, Long userId);
}
