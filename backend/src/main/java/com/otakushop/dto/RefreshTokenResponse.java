package com.otakushop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RefreshTokenResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    
    public RefreshTokenResponse(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}
