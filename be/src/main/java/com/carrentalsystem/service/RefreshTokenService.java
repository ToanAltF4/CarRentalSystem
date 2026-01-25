package com.carrentalsystem.service;

import com.carrentalsystem.entity.RefreshTokenEntity;
import com.carrentalsystem.entity.UserEntity;

/**
 * Service interface for Refresh Token management.
 * Enforces single-session per user (1 user = 1 refresh token).
 */
public interface RefreshTokenService {

    /**
     * Create or update refresh token for user (UPSERT operation).
     * If user already has a token, it will be updated with new token and expiry.
     * If not, a new token will be created.
     * 
     * @param user The user to create/update token for
     * @return The created or updated refresh token entity
     */
    RefreshTokenEntity createOrUpdateRefreshToken(UserEntity user);

    /**
     * Validate refresh token existence, revocation status, and expiry.
     * 
     * @param token The refresh token string to validate
     * @return The valid refresh token entity
     * @throws IllegalArgumentException if token is invalid or expired
     */
    RefreshTokenEntity validateRefreshToken(String token);

    /**
     * Revoke refresh token for a user.
     * Deletes refresh token for the user.
     * Nullifies token and expiryDate for absolute security.
     * 
     * @param user The user whose token should be revoked
     */
    void revokeByUser(UserEntity user);
}
