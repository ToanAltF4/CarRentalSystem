package com.carrentalsystem.service;

import com.carrentalsystem.dto.auth.AuthResponse;
import com.carrentalsystem.dto.auth.LoginRequest;
import com.carrentalsystem.dto.auth.RegisterRequest;

/**
 * Service interface for authentication operations.
 */
public interface AuthService {

    /**
     * Authenticate user and generate tokens.
     * Validates user credentials and account status.
     * 
     * @param request Login credentials
     * @return AuthResponse with access token and refresh token
     */
    AuthResponse login(LoginRequest request);

    /**
     * Refresh access token using refresh token.
     * 
     * @param refreshToken Refresh token string
     * @return AuthResponse with new access token
     */
    AuthResponse refreshAccessToken(String refreshToken);

    /**
     * Logout user by revoking refresh token.
     * 
     * @param username Username to logout
     */
    void logout(String username);

    /**
     * Register new user with minimal validation.
     * Creates user with ACTIVE status and CUSTOMER role.
     * Does NOT auto-login or generate tokens.
     * 
     * @param request Registration data
     * @throws IllegalArgumentException if username or email already exists
     */
    void register(RegisterRequest request);
}
