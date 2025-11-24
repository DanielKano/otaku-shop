package com.otakushop.service;

import com.otakushop.dto.*;
import com.otakushop.entity.Product;
import com.otakushop.entity.Review;
import com.otakushop.entity.User;
import com.otakushop.exception.BadRequestException;
import com.otakushop.exception.ResourceNotFoundException;
import com.otakushop.repository.ProductRepository;
import com.otakushop.repository.ReviewRepository;
import com.otakushop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    
    @Transactional
    public ReviewResponse createReview(Long userId, ReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
        
        // Verificar que el usuario no haya dejado ya una reseña
        if (reviewRepository.existsByProductIdAndUserId(request.getProductId(), userId)) {
            throw new BadRequestException("Ya has dejado una reseña para este producto");
        }
        
        Review review = new Review();
        review.setProduct(product);
        review.setUser(user);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        
        // TODO: Verificar si el usuario compró el producto (verified = true)
        // review.setVerified(orderService.hasUserPurchasedProduct(userId, productId));
        
        Review savedReview = reviewRepository.save(review);
        
        // Notificar al vendedor del producto
        if (product.getVendor() != null) {
            notificationService.createNotification(
                product.getVendor().getId(),
                "Nueva reseña recibida",
                "Tu producto \"" + product.getName() + "\" ha recibido una nueva reseña de " + 
                review.getRating() + " estrellas",
                "NEW_REVIEW"
            );
        }
        
        return mapToResponse(savedReview);
    }
    
    @Transactional
    public ReviewResponse updateReview(Long reviewId, Long userId, ReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Reseña no encontrada"));
        
        if (!review.getUser().getId().equals(userId)) {
            throw new BadRequestException("No tienes permiso para editar esta reseña");
        }
        
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        
        Review updatedReview = reviewRepository.save(review);
        return mapToResponse(updatedReview);
    }
    
    @Transactional
    public void deleteReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Reseña no encontrada"));
        
        if (!review.getUser().getId().equals(userId)) {
            throw new BadRequestException("No tienes permiso para eliminar esta reseña");
        }
        
        reviewRepository.delete(review);
    }
    
    public Page<ReviewResponse> getProductReviews(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return reviewRepository.findByProductId(productId, pageable)
                .map(this::mapToResponse);
    }
    
    public Page<ReviewResponse> getUserReviews(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return reviewRepository.findByUserId(userId, pageable)
                .map(this::mapToResponse);
    }
    
    public ProductRatingStats getProductRatingStats(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Producto no encontrado");
        }
        
        Double avgRating = reviewRepository.getAverageRatingByProductId(productId);
        Long totalReviews = reviewRepository.countByProductId(productId);
        
        Map<Integer, Long> distribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            Long count = reviewRepository.countByProductIdAndRating(productId, i);
            distribution.put(i, count);
        }
        
        return new ProductRatingStats(
            avgRating != null ? avgRating : 0.0,
            totalReviews,
            distribution
        );
    }
    
    @Transactional
    public ReviewResponse addVendorResponse(Long reviewId, Long vendorId, String response) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Reseña no encontrada"));
        
        // Verificar que el vendedor sea el dueño del producto
        if (!review.getProduct().getVendor().getId().equals(vendorId)) {
            throw new BadRequestException("No tienes permiso para responder a esta reseña");
        }
        
        review.setVendorResponse(response);
        review.setVendorResponseDate(java.time.LocalDateTime.now());
        
        Review updatedReview = reviewRepository.save(review);
        
        // Notificar al usuario que dejó la reseña
        notificationService.createNotification(
            review.getUser().getId(),
            "Respuesta a tu reseña",
            "El vendedor ha respondido a tu reseña del producto \"" + review.getProduct().getName() + "\"",
            "NEW_REVIEW"
        );
        
        return mapToResponse(updatedReview);
    }
    
    private ReviewResponse mapToResponse(Review review) {
        return new ReviewResponse(
            review.getId(),
            review.getProduct().getId(),
            review.getProduct().getName(),
            review.getUser().getId(),
            review.getUser().getName(),
            review.getRating(),
            review.getComment(),
            review.isVerified(),
            review.getCreatedAt(),
            review.getUpdatedAt(),
            review.getVendorResponse(),
            review.getVendorResponseDate()
        );
    }
}
