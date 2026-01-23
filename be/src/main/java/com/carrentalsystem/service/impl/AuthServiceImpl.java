package com.carrentalsystem.service.impl;

import com.carrentalsystem.dto.auth.AuthResponse;
import com.carrentalsystem.dto.auth.LoginRequest;
import com.carrentalsystem.dto.auth.RegisterRequest;
import com.carrentalsystem.entity.RefreshTokenEntity;
import com.carrentalsystem.entity.UserEntity;
import com.carrentalsystem.entity.UserRole;
import com.carrentalsystem.exception.ResourceNotFoundException;
import com.carrentalsystem.repository.UserRepository;
import com.carrentalsystem.service.AuthService;
import com.carrentalsystem.service.JwtService;
import com.carrentalsystem.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of AuthService.
 * Handles login, token refresh, and logout with status validation.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for username: {}", request.getUsername());

        // Find user
        UserEntity user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        // Validate password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Invalid password for user: {}", request.getUsername());
            throw new IllegalArgumentException("Invalid username or password");
        }

        // Validate account status (as per leader's requirement)
        if ("INACTIVE".equals(user.getStatus()) || "LOCKED".equals(user.getStatus())) {
            log.warn("Login denied for user {} with status: {}", request.getUsername(), user.getStatus());
            throw new IllegalArgumentException(
                    "Account is " + user.getStatus().toLowerCase() + ". Please contact administrator.");
        }

        // Generate JWT access token with claims
        String accessToken = jwtService.generateAccessToken(user);

        // Create or update refresh token (enforce 1 user = 1 session)
        RefreshTokenEntity refreshTokenEntity = refreshTokenService.createOrUpdateRefreshToken(user);

        log.info("Login successful for user: {}", request.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenEntity.getToken())
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    @Override
    @Transactional
    public AuthResponse refreshAccessToken(String refreshToken) {
        log.info("Refreshing access token");

        // Validate refresh token (checks existence, revocation, expiry)
        RefreshTokenEntity validToken = refreshTokenService.validateRefreshToken(refreshToken);

        UserEntity user = validToken.getUser();

        // Generate new access token
        String newAccessToken = jwtService.generateAccessToken(user);

        log.info("Access token refreshed for user: {}", user.getUsername());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken) // Keep same refresh token
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    @Override
    @Transactional
    public void logout(String username) {
        log.info("Logout request for user: {}", username);

        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // Revoke refresh token (sets revoked=true, nullifies token)
        refreshTokenService.revokeByUser(user);

        log.info("User logged out successfully: {}", username);
    }

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        log.info("Registration attempt for username: {}", request.getUsername());

        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            log.warn("Registration failed: username {} already exists", request.getUsername());
            throw new IllegalArgumentException("Username already exists");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed: email {} already exists", request.getEmail());
            throw new IllegalArgumentException("Email already exists");
        }

        // Create new user entity
        UserEntity newUser = UserEntity.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword())) // Hash password
                .email(request.getEmail())
                .fullName(request.getFullName())
                .role(UserRole.CUSTOMER) // Always CUSTOMER for public registration
                .status("ACTIVE") // New users are ACTIVE by default
                .build();

        userRepository.save(newUser);

        log.info("User registered successfully: {}", request.getUsername());
    }
}
