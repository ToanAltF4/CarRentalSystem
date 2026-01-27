package com.carrentalsystem.repository;

import com.carrentalsystem.entity.PasswordResetTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Repository for password reset token operations.
 */
@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetTokenEntity, Long> {

    /**
     * Find valid (unused) token.
     *
     * @param token Reset token
     * @return Optional token entity
     */
    Optional<PasswordResetTokenEntity> findByTokenAndUsedFalse(String token);

    /**
     * Delete all tokens for an email.
     *
     * @param email User email
     */
    void deleteByEmail(String email);

    /**
     * Delete expired tokens.
     *
     * @param now Current timestamp
     */
    void deleteByExpiresAtBefore(LocalDateTime now);
}
