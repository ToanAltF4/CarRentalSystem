package com.carrentalsystem.repository;

import com.carrentalsystem.entity.RefreshTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Repository interface for RefreshTokenEntity operations.
 * Supports single-session management through userId lookup.
 */
@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshTokenEntity, Long> {

    /**
     * Find refresh token by token string - used for token validation and refresh
     */
    Optional<RefreshTokenEntity> findByToken(String token);

    /**
     * Find refresh token by user ID - CRITICAL for single-session enforcement.
     * Used to check if user already has an existing token (upsert logic).
     */
    Optional<RefreshTokenEntity> findByUserId(Long userId);

    /**
     * Delete refresh token by user ID - used for session cleanup.
     * Transactional to ensure atomicity.
     */
    @Modifying
    @Transactional
    void deleteByUserId(Long userId);
}
