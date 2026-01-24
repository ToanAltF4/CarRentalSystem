package com.carrentalsystem.service.impl;

import com.carrentalsystem.entity.UserEntity;
import com.carrentalsystem.service.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Implementation of JwtService using JJWT library.
 */
@Slf4j
@Service
public class JwtServiceImpl implements JwtService {

    @Value("${app.auth.jwt.secret:ev-fleet-secret-key-minimum-32-characters-required-for-hs256}")
    private String jwtSecret;

    @Value("${app.auth.jwt.expiration-ms:3600000}")
    private long jwtExpirationMs; // Default 1 hour

    @Override
    public String generateAccessToken(UserEntity user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("email", user.getEmail());
        claims.put("username", user.getEmail());
        claims.put("role", user.getRole() != null ? user.getRole().getRoleName() : "ROLE_CUSTOMER");
        claims.put("fullName", user.getFullName());

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        String token = Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();

        log.debug("Generated JWT for user: {}", user.getEmail());
        return token;
    }

    @Override
    public String getUsernameFromToken(String token) {
        Claims claims = getClaims(token);
        return claims.getSubject();
    }

    @Override
    public Long getUserId(String token) {
        Claims claims = getClaims(token);
        return claims.get("userId", Long.class);
    }

    @Override
    public String getUsername(String token) {
        Claims claims = getClaims(token);
        String username = claims.get("username", String.class);
        if (username == null || username.isBlank()) {
            username = claims.getSubject();
        }
        return username;
    }

    @Override
    public String getRole(String token) {
        Claims claims = getClaims(token);
        return claims.get("role", String.class);
    }

    @Override
    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception e) {
            log.error("JWT validation error: {}", e.getMessage());
            return false;
        }
    }

    private Claims getClaims(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
