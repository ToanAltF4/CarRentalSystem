package com.carrentalsystem.service;

/**
 * Service interface for sending emails.
 */
public interface EmailService {

    /**
     * Send OTP verification email to user.
     *
     * @param to       Recipient email address
     * @param otp      6-digit OTP code
     * @param fullName User's full name
     */
    void sendOtpEmail(String to, String otp, String fullName);

    /**
     * Send password reset email with reset link.
     *
     * @param to         Recipient email address
     * @param resetToken Password reset token
     * @param fullName   User's full name
     */
    void sendPasswordResetEmail(String to, String resetToken, String fullName);

    /**
     * Send welcome email to user after successful verification.
     *
     * @param to       Recipient email address
     * @param fullName User's full name
     */
    void sendWelcomeEmail(String to, String fullName);
}
