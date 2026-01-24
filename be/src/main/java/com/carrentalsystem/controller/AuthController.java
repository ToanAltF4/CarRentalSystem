package com.carrentalsystem.controller;

import com.carrentalsystem.dto.auth.AuthResponse;
import com.carrentalsystem.dto.auth.LoginRequest;
import com.carrentalsystem.dto.auth.RegisterRequest;
import com.carrentalsystem.dto.auth.RegisterResponse;
import com.carrentalsystem.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

/**
 * REST Controller for authentication operations.
 * Provides endpoints for login, token refresh, and logout.
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "API endpoints for user authentication and authorization")
public class AuthController {

    private final AuthService authService;

    /**
     * Login endpoint.
     * Validates credentials and account status, returns JWT + refresh token in
     * HttpOnly cookie.
     * 
     * @param request  Login credentials
     * @param response HTTP response to set cookie
     * @return AuthResponse with access token and user info (refresh token in
     *         cookie)
     */
    @Operation(summary = "User login", description = "Authenticates user and returns JWT access token. Refresh token is set as HttpOnly cookie.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login successful"),
            @ApiResponse(responseCode = "401", description = "Invalid credentials"),
            @ApiResponse(responseCode = "403", description = "Account is inactive")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        log.info("POST /api/auth/login - email: {}", request.getEmail());
        AuthResponse authResponse = authService.login(request);

        // Set refresh token as HttpOnly cookie
        Cookie refreshTokenCookie = new Cookie("refreshToken", authResponse.getRefreshToken());
        refreshTokenCookie.setHttpOnly(true); // CRITICAL: Prevent JavaScript access
        refreshTokenCookie.setSecure(false); // false for http://localhost, true for https
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        // SameSite=Lax is default in modern browsers

        response.addCookie(refreshTokenCookie);

        // Remove refresh token from response body for security
        authResponse.setRefreshToken(null);

        return ResponseEntity.ok(authResponse);
    }

    /**
     * Register endpoint.
     * Creates new user with ACTIVE status and CUSTOMER role.
     * Does NOT auto-login or return tokens.
     * 
     * @param request Registration data (validated)
     * @return Success message with 201 Created
     */
    @Operation(summary = "User registration", description = "Registers a new user account with CUSTOMER role")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "User registered successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "409", description = "Email already exists")
    })
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("POST /api/auth/register - email: {}", request.getEmail());
        authService.register(request);

        RegisterResponse response = RegisterResponse.builder()
                .message("User registered successfully")
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Refresh token endpoint.
     * Reads refresh token from HttpOnly cookie and issues new access token.
     * 
     * @param request  HTTP request to read cookie
     * @param response HTTP response to set new cookie
     * @return AuthResponse with new access token
     */
    @Operation(summary = "Refresh access token", description = "Generates a new access token using the refresh token from HttpOnly cookie")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
            @ApiResponse(responseCode = "401", description = "Invalid or expired refresh token")
    })
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        log.info("POST /api/auth/refresh");

        // Read refresh token from cookie
        String refreshToken = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }

        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        AuthResponse authResponse = authService.refreshAccessToken(refreshToken);

        // Set new refresh token cookie (refresh token might be rotated)
        Cookie newRefreshTokenCookie = new Cookie("refreshToken", authResponse.getRefreshToken());
        newRefreshTokenCookie.setHttpOnly(true);
        newRefreshTokenCookie.setSecure(false);
        newRefreshTokenCookie.setPath("/");
        newRefreshTokenCookie.setMaxAge(7 * 24 * 60 * 60);

        response.addCookie(newRefreshTokenCookie);

        // Remove refresh token from response body
        authResponse.setRefreshToken(null);

        return ResponseEntity.ok(authResponse);
    }

    /**
     * Logout endpoint.
     * Revokes refresh token for current user and clears HttpOnly cookie.
     * 
     * @param principal Current authenticated user (will be available after Security
     *                  config)
     * @param response  HTTP response to clear cookie
     * @return Success message
     */
    @Operation(summary = "User logout", description = "Logs out the current user and revokes refresh token. Requires authentication.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Logout successful"),
            @ApiResponse(responseCode = "400", description = "User not authenticated"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping("/logout")
    public ResponseEntity<String> logout(Principal principal, HttpServletResponse response) {
        String email = principal != null ? principal.getName() : "unknown";
        log.info("POST /api/auth/logout - user: {}", email);

        if (principal == null) {
            return ResponseEntity.badRequest().body("User not authenticated");
        }

        authService.logout(email);

        // Clear refresh token cookie
        Cookie clearCookie = new Cookie("refreshToken", null);
        clearCookie.setHttpOnly(true);
        clearCookie.setSecure(false);
        clearCookie.setPath("/");
        clearCookie.setMaxAge(0); // Expire immediately

        response.addCookie(clearCookie);

        return ResponseEntity.ok("Logged out successfully");
    }
}
