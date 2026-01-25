package com.carrentalsystem.service.impl;

import com.carrentalsystem.entity.RefreshTokenEntity;
import com.carrentalsystem.entity.UserEntity;
import com.carrentalsystem.repository.RefreshTokenRepository;
import com.carrentalsystem.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

/**
 * Implementation of RefreshTokenService.
 * Implements single-session per user logic through UPSERT operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.auth.refresh-token.expiration-days:7}")
    private int refreshTokenExpirationDays;

    @Override
    @Transactional
    public RefreshTokenEntity createOrUpdateRefreshToken(UserEntity user) {
        log.info("Creating or updating refresh token for user: {}", user.getEmail());

        // Check if user already has a refresh token (enforce 1 user = 1 token)
        Optional<RefreshTokenEntity> existingToken = refreshTokenRepository.findByUserId(user.getId());

        RefreshTokenEntity refreshToken;

        if (existingToken.isPresent()) {
            // UPDATE existing token (upsert logic)
            refreshToken = existingToken.get();
            refreshToken.setToken(generateRefreshToken());
            refreshToken.setExpiryDate(calculateExpiryDate());
            log.info("Updated existing refresh token for user: {}", user.getEmail());
        } else {
            // INSERT new token
            refreshToken = RefreshTokenEntity.builder()
                    .user(user)
                    .token(generateRefreshToken())
                    .expiryDate(calculateExpiryDate())
                    .build();
            log.info("Created new refresh token for user: {}", user.getEmail());
        }

        return refreshTokenRepository.save(refreshToken);
    }

    @Override
    @Transactional(readOnly = true)
    public RefreshTokenEntity validateRefreshToken(String token) {
        log.debug("Validating refresh token");

        // Find token
        RefreshTokenEntity refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        // Check if expired
        if (refreshToken.getExpiryDate() != null && refreshToken.getExpiryDate().isBefore(Instant.now())) {
            log.warn("Refresh token has expired for user: {}", refreshToken.getUser().getEmail());
            throw new IllegalArgumentException("Refresh token has expired");
        }

        log.debug("Refresh token is valid for user: {}", refreshToken.getUser().getEmail());
        return refreshToken;
    }

    @Override
    @Transactional
    public void revokeByUser(UserEntity user) {
        log.info("Revoking refresh token for user: {}", user.getEmail());

        if (refreshTokenRepository.findByUserId(user.getId()).isPresent()) {
            refreshTokenRepository.deleteByUserId(user.getId());
            log.info("Successfully revoked refresh token for user: {}", user.getEmail());
        } else {
            log.warn("No refresh token found for user: {}", user.getEmail());
        }
    }

    // ============== Private Helper Methods ==============

    /**
     * Generate random refresh token using UUID.
     * 
     * @return Random UUID string
     */
    private String generateRefreshToken() {
        return UUID.randomUUID().toString();
    }

    /**
     * Calculate expiry date based on configured days.
     * 
     * @return Instant representing expiry date
     */
    private Instant calculateExpiryDate() {
        return Instant.now().plus(refreshTokenExpirationDays, ChronoUnit.DAYS);
    }
}
