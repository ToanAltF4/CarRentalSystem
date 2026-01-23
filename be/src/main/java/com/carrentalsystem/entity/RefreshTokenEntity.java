package com.carrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDateTime;

/**
 * JPA Entity representing a refresh token for JWT authentication.
 * Enforces single-session per user through OneToOne relationship with unique
 * user_id constraint.
 * 
 * Security model:
 * - One user can only have ONE active refresh token (single session)
 * - When user logs in again, existing token is replaced (upsert operation)
 * - On logout: revoked=true AND token/expiryDate are nullified for absolute
 * security
 */
@Entity
@Table(name = "refresh_tokens", indexes = {
        @Index(name = "idx_refresh_tokens_user", columnList = "user_id"),
        @Index(name = "idx_refresh_tokens_token", columnList = "token")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshTokenEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * OneToOne relationship with User - ensures 1 user = 1 session.
     * The unique=true constraint prevents multiple tokens per user at DB level.
     */
    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", unique = true, nullable = false)
    private UserEntity user;

    /**
     * The refresh token string. Nullable to support nullification on logout.
     */
    @Column(name = "token", length = 500)
    private String token;

    /**
     * Token expiry timestamp. Nullable to support nullification on logout.
     */
    @Column(name = "expiry_date")
    private Instant expiryDate;

    /**
     * Revocation flag. Set to true on logout or when token is invalidated.
     */
    @Column(name = "revoked", nullable = false)
    @Builder.Default
    private boolean revoked = false;

    /**
     * Timestamp when token was revoked. Used for audit trail.
     */
    @Column(name = "revoked_at")
    private Instant revokedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
