package com.carrentalsystem.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating/updating a user
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRequestDTO {

    private String fullName;

    private String email;

    private String password;

    private String phone;

    private Long roleId;

    private String status;

    private String licenseType;

    private String licenseNumber;
}
