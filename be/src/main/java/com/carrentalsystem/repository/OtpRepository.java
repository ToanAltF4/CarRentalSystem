package com.carrentalsystem.repository;

import com.carrentalsystem.entity.OtpEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Repository for OTP entity operations.
 */
@Repository
public interface OtpRepository extends JpaRepository<OtpEntity, Long> {

    /**
     * Find valid OTP by email and code.
     *
     * @param email   User email
     * @param otpCode OTP code
     * @return Optional OTP entity
     */
    Optional<OtpEntity> findByEmailAndOtpCodeAndVerifiedFalse(String email, String otpCode);

    /**
     * Find the latest unverified OTP for an email.
     *
     * @param email User email
     * @return Optional OTP entity
     */
    Optional<OtpEntity> findTopByEmailAndVerifiedFalseOrderByCreatedAtDesc(String email);

    /**
     * Delete all OTP codes for an email.
     *
     * @param email User email
     */
    void deleteByEmail(String email);

    /**
     * Delete expired OTP codes.
     *
     * @param now Current timestamp
     */
    void deleteByExpiresAtBefore(LocalDateTime now);
}
