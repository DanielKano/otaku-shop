package com.otakushop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRatingStats {
    private Double averageRating;
    private Long totalReviews;
    private Map<Integer, Long> ratingDistribution; // 1-5 estrellas -> cantidad
}
