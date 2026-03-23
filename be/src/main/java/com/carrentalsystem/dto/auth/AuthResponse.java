package com.carrentalsystem.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for authentication operations.
 * Contains access token (JWT) and refresh token.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;

    // User info for frontend
    private Long userId;
    private String email;
    private String fullName;
    private String role;
    private String accountStatus;
    private String licenseStatus;
}
