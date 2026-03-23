package com.carrentalsystem.service;

/**
 * Service interface for OTP operations.
 */
public interface OtpService {

    /**
     * Generate and send OTP to user's email.
     *
     * @param email    User email
     * @param fullName User's full name
     */
    void generateAndSendOtp(String email, String fullName);

    /**
     * Verify OTP code for an email.
     *
     * @param email   User email
     * @param otpCode OTP code to verify
     * @return true if OTP is valid, false otherwise
     */
    boolean verifyOtp(String email, String otpCode);

    /**
     * Resend OTP to user's email.
     *
     * @param email User email
     */
    void resendOtp(String email);
}
