package com.carrentalsystem.dto.profile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    private String fullName;
    private String email;
    private String phoneNumber;
    private String accountStatus;
    private String licenseStatus;
    private String licenseType;
    private String licenseNumber;
    private LocalDate dateOfBirth;
    private String licenseFrontImageUrl;
}
