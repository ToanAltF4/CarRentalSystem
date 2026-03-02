package com.carrentalsystem.service;

import com.carrentalsystem.entity.UserEntity;
import io.jsonwebtoken.Claims;

/**
 * Service for JWT token generation and validation.
 */
public interface JwtService {

    /**
     * Generate access token (JWT) for authenticated user.
     * Token contains claims: userId, username, role, fullName.
     * 
     * @param user The authenticated user
     * @return JWT access token string
     */
    String generateAccessToken(UserEntity user);

    /**
     * Validate JWT token and extract username.
     * 
     * @param token JWT token
     * @return Username from token
     */
    String getUsernameFromToken(String token);

    /**
     * Extract user ID from JWT token.
     * 
     * @param token JWT token
     * @return User ID
     */
    Long getUserId(String token);

    /**
     * Extract username from JWT token.
     * 
     * @param token JWT token
     * @return Username
     */
    String getUsername(String token);

    /**
     * Extract role from JWT token.
     * 
     * @param token JWT token
     * @return User role
     */
    String getRole(String token);

    /**
     * Parse JWT token claims in a single pass.
     *
     * @param token JWT token
     * @return Parsed claims
     */
    Claims getClaims(String token);

    /**
     * Validate if JWT token is valid and not expired.
     * 
     * @param token JWT token
     * @return true if valid, false otherwise
     */
    boolean validateToken(String token);
}
