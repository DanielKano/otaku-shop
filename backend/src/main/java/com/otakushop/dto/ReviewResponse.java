package com.otakushop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long productId;
    private String productName;
    private Long userId;
    private String userName;
    private Integer rating;
    private String comment;
    private boolean verified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String vendorResponse;
    private LocalDateTime vendorResponseDate;
}
