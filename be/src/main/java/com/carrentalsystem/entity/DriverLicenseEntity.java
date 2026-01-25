package com.carrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "driver_licenses", indexes = {
        @Index(name = "idx_driver_licenses_user", columnList = "user_id"),
        @Index(name = "idx_driver_licenses_status", columnList = "status_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverLicenseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UserEntity user;

    @Column(name = "license_type", length = 50)
    private String licenseType;

    @Column(name = "license_number", length = 50)
    private String licenseNumber;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "front_image_url", length = 500)
    private String frontImageUrl;

    @Convert(converter = com.carrentalsystem.entity.converter.LicenseStatusConverter.class)
    @Column(name = "status_id")
    @Builder.Default
    private LicenseStatus status = LicenseStatus.PENDING;
}
