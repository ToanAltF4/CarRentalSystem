package com.carrentalsystem.dto.operator;

import com.carrentalsystem.entity.LicenseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for user information in operator context.
 * Used for license verification workflow.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLicenseDTO {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;

    // License information
    private String licenseNumber;
    private String licenseType;
    private LocalDate dateOfBirth;
    private String licenseFrontImageUrl;
    private LicenseStatus licenseStatus;

    // Role information
    private String role;
}
