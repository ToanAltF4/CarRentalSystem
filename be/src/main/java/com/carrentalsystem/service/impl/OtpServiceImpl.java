package com.carrentalsystem.service.impl;

import com.carrentalsystem.entity.OtpEntity;
import com.carrentalsystem.entity.UserEntity;
import com.carrentalsystem.repository.OtpRepository;
import com.carrentalsystem.repository.UserRepository;
import com.carrentalsystem.service.EmailService;
import com.carrentalsystem.service.OtpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

/**
 * Implementation of OTP service.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private final OtpRepository otpRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${app.otp.expiration-minutes:10}")
    private int otpExpirationMinutes;

    private static final Random RANDOM = new Random();

    @Override
    @Transactional
    public void generateAndSendOtp(String email, String fullName) {
        log.info("Generating OTP for email: {}", email);

        // Check if there's a recent OTP (rate limiting - 1 per minute)
        otpRepository.findTopByEmailAndVerifiedFalseOrderByCreatedAtDesc(email)
                .ifPresent(existingOtp -> {
                    if (existingOtp.getCreatedAt().isAfter(LocalDateTime.now().minusMinutes(1))) {
                        throw new IllegalStateException("Vui lòng đợi 1 phút trước khi yêu cầu OTP mới");
                    }
                });

        // Delete old OTP codes for this email
        otpRepository.deleteByEmail(email);

        // Generate 6-digit OTP
        String otpCode = String.format("%06d", RANDOM.nextInt(1000000));

        // Create OTP entity
        OtpEntity otp = OtpEntity.builder()
                .email(email)
                .otpCode(otpCode)
                .expiresAt(LocalDateTime.now().plusMinutes(otpExpirationMinutes))
                .verified(false)
                .build();

        otpRepository.save(otp);

        // Send OTP email
        emailService.sendOtpEmail(email, otpCode, fullName);

        log.info("OTP generated and sent successfully for email: {}", email);
    }

    @Override
    @Transactional
    public boolean verifyOtp(String email, String otpCode) {
        log.info("Verifying OTP for email: {}", email);

        // Find OTP by email and code
        OtpEntity otp = otpRepository.findByEmailAndOtpCodeAndVerifiedFalse(email, otpCode)
                .orElseThrow(() -> new IllegalArgumentException("Mã OTP không hợp lệ"));

        // Check if OTP is expired
        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("OTP expired for email: {}", email);
            throw new IllegalArgumentException("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới");
        }

        // Mark OTP as verified
        otp.setVerified(true);
        otpRepository.save(otp);

        // Update user email verification status
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));

        user.setStatus("ACTIVE");
        userRepository.save(user);

        // Send welcome email
        emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());

        log.info("OTP verified successfully for email: {}", email);
        return true;
    }

    @Override
    @Transactional
    public void resendOtp(String email) {
        log.info("Resending OTP for email: {}", email);

        // Check if user exists
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email không tồn tại trong hệ thống"));

        // Check if user is already verified
        if ("ACTIVE".equals(user.getStatus())) {
            throw new IllegalStateException("Tài khoản đã được xác thực");
        }

        // Generate and send new OTP
        generateAndSendOtp(email, user.getFullName());
    }
}
