package com.carrentalsystem.service.impl;

import com.carrentalsystem.entity.PasswordResetTokenEntity;
import com.carrentalsystem.entity.UserEntity;
import com.carrentalsystem.repository.PasswordResetTokenRepository;
import com.carrentalsystem.repository.UserRepository;
import com.carrentalsystem.service.EmailService;
import com.carrentalsystem.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Implementation of password reset service.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.password-reset.expiration-hours:1}")
    private int resetExpirationHours;

    @Override
    @Transactional
    public void requestPasswordReset(String email) {
        log.info("Password reset requested for email: {}", email);

        // Check if user exists
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email không tồn tại trong hệ thống"));

        // Check if user account is active
        if (!"ACTIVE".equals(user.getStatus())) {
            throw new IllegalStateException("Tài khoản chưa được kích hoạt hoặc đã bị khóa");
        }

        // Delete old reset tokens for this email
        tokenRepository.deleteByEmail(email);

        // Generate secure token (UUID)
        String token = UUID.randomUUID().toString();

        // Create reset token entity
        PasswordResetTokenEntity resetToken = PasswordResetTokenEntity.builder()
                .email(email)
                .token(token)
                .expiresAt(LocalDateTime.now().plusHours(resetExpirationHours))
                .used(false)
                .build();

        tokenRepository.save(resetToken);

        // Send password reset email
        emailService.sendPasswordResetEmail(email, token, user.getFullName());

        log.info("Password reset token generated and email sent for: {}", email);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validateResetToken(String token) {
        log.info("Validating reset token");

        return tokenRepository.findByTokenAndUsedFalse(token)
                .map(resetToken -> {
                    if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
                        log.warn("Reset token expired");
                        return false;
                    }
                    return true;
                })
                .orElse(false);
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        log.info("Resetting password with token");

        // Find and validate token
        PasswordResetTokenEntity resetToken = tokenRepository.findByTokenAndUsedFalse(token)
                .orElseThrow(() -> new IllegalArgumentException("Token không hợp lệ hoặc đã được sử dụng"));

        // Check if token is expired
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("Reset token expired");
            throw new IllegalArgumentException("Token đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới");
        }

        // Find user
        UserEntity user = userRepository.findByEmail(resetToken.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));

        // Validate new password (basic validation)
        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("Mật khẩu mới phải có ít nhất 8 ký tự");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        log.info("Password reset successfully for email: {}", resetToken.getEmail());
    }
}
