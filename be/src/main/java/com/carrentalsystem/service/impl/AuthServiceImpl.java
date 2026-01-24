package com.carrentalsystem.service.impl;

import com.carrentalsystem.dto.auth.AuthResponse;
import com.carrentalsystem.dto.auth.LoginRequest;
import com.carrentalsystem.dto.auth.RegisterRequest;
import com.carrentalsystem.entity.RefreshTokenEntity;
import com.carrentalsystem.entity.RoleEntity;
import com.carrentalsystem.entity.UserEntity;
import com.carrentalsystem.exception.ResourceNotFoundException;
import com.carrentalsystem.repository.RoleRepository;
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
    private final RoleRepository roleRepository;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        // Find user by email
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        // Validate password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Invalid password for user: {}", request.getEmail());
            throw new IllegalArgumentException("Invalid email or password");
        }

        // Validate account status (ACTIVE, INACTIVE, BANNED)
        if ("INACTIVE".equals(user.getStatus()) || "BANNED".equals(user.getStatus())) {
            log.warn("Login denied for user {} with status: {}", request.getEmail(), user.getStatus());
            throw new IllegalArgumentException(
                    "Account is " + user.getStatus().toLowerCase() + ". Please contact administrator.");
        }

        // Generate JWT access token with claims
        String accessToken = jwtService.generateAccessToken(user);

        // Create or update refresh token (enforce 1 user = 1 session)
        RefreshTokenEntity refreshTokenEntity = refreshTokenService.createOrUpdateRefreshToken(user);

        log.info("Login successful for user: {}", request.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenEntity.getToken())
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole() != null ? user.getRole().getRoleName() : "ROLE_CUSTOMER")
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

        log.info("Access token refreshed for user: {}", user.getEmail());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken) // Keep same refresh token
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole() != null ? user.getRole().getRoleName() : "ROLE_CUSTOMER")
                .build();
    }

    @Override
    @Transactional
    public void logout(String email) {
        log.info("Logout request for user: {}", email);

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        // Revoke refresh token (sets revoked=true, nullifies token)
        refreshTokenService.revokeByUser(user);

        log.info("User logged out successfully: {}", email);
    }

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        log.info("Registration attempt for email: {}", request.getEmail());

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed: email {} already exists", request.getEmail());
            throw new IllegalArgumentException("Email already exists");
        }

        // Get ROLE_CUSTOMER role from database
        RoleEntity customerRole = roleRepository.findByRoleName("ROLE_CUSTOMER")
                .orElseThrow(() -> new IllegalStateException("Default role ROLE_CUSTOMER not found in database"));

        // Create new user entity
        UserEntity newUser = UserEntity.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // Hash password
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .licenseNumber(request.getLicenseNumber())
                .role(customerRole) // Always CUSTOMER for public registration
                .status("ACTIVE") // New users are ACTIVE by default
                .build();

        userRepository.save(newUser);

        log.info("User registered successfully: {}", request.getEmail());
    }
}
