package com.carrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * JPA Entity representing a user in the EV Fleet authentication system.
 * Contains authentication credentials, profile data, and account status.
 */
@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_email", columnList = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "phone", length = 20)
    private String phoneNumber;

    @Transient
    private String address;

    @Transient
    private String avatarUrl;

    /**
     * Account status: ACTIVE, INACTIVE, BANNED
     * Only ACTIVE users can login and receive refresh tokens
     */
    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "license_type", length = 50)
    private String licenseType;

    @Column(name = "license_number", length = 50)
    private String licenseNumber;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "license_front_image_url", length = 500)
    private String licenseFrontImageUrl;

    @Convert(converter = com.carrentalsystem.entity.converter.LicenseStatusConverter.class)
    @Column(name = "license_status", length = 30)
    private LicenseStatus licenseStatus;

    /**
     * Driver-specific fields (for users with ROLE_DRIVER)
     * These are transient - not persisted in the V19 schema
     */
    @Transient
    private String driverStatus;

    @Transient
    @Builder.Default
    private Boolean driverAvailable = false;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private RoleEntity role;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
