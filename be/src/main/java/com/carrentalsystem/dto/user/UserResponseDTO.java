package com.carrentalsystem.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Response DTO for User data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String status;

    // Role
    private Long roleId;
    private String roleName;

    // License info
    private String licenseStatus;
    private String licenseType;
    private String licenseNumber;
    private LocalDate dateOfBirth;
    private String licenseFrontImageUrl;

    // Driver info
    private String driverStatus;
    private Boolean driverAvailable;
}
