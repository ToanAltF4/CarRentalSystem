package com.carrentalsystem.service;

/**
 * Service interface for password reset operations.
 */
public interface PasswordResetService {

    /**
     * Request password reset - generates token and sends email.
     *
     * @param email User email
     */
    void requestPasswordReset(String email);

    /**
     * Validate reset token.
     *
     * @param token Reset token
     * @return true if token is valid, false otherwise
     */
    boolean validateResetToken(String token);

    /**
     * Reset password using token.
     *
     * @param token       Reset token
     * @param newPassword New password
     */
    void resetPassword(String token, String newPassword);
}
