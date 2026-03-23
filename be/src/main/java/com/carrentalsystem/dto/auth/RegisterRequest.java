package com.carrentalsystem.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

/**
 * Request DTO for user registration.
 * Includes comprehensive validation for all fields.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-zA-Z]).{6,}$", message = "Password must contain at least one letter and one number")
    private String password;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 255, message = "Full name must be between 2 and 255 characters")
    @Pattern(regexp = "^[a-zA-ZÀ-ỹ\\s]+$", message = "Full name must contain only letters and spaces")
    private String fullName;

    // Optional fields - only validate if not blank
    // Simple regex: accepts +84 912 345 678, 0912-345-678, etc. (digits, spaces,
    // hyphens only)
    @Pattern(regexp = "^$|^\\+?[0-9\\s-]{7,20}$", message = "Please provide a valid phone number")
    private String phoneNumber;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    @Pattern(regexp = "^$|^[A-Z0-9-]{5,50}$", message = "License number must be 5-50 characters, uppercase letters, numbers, and hyphens only")
    @Size(max = 50, message = "License number must not exceed 50 characters")
    private String licenseNumber; // Required for customers who want to rent vehicles
}
