package com.carrentalsystem.controller;

import com.carrentalsystem.entity.LicenseStatus;
import com.carrentalsystem.entity.UserEntity;
import com.carrentalsystem.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Admin User Management Controller
 * Allows admins to view users and approve/reject driver licenses
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@Tag(name = "Admin User Management", description = "Admin endpoints for managing users and licenses")
public class AdminUserController {

        private final UserRepository userRepository;

        @Operation(summary = "Get all users")
        @GetMapping
        @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
        public ResponseEntity<List<UserDTO>> getAllUsers() {
                List<UserEntity> users = userRepository.findAll();
                List<UserDTO> dtos = users.stream()
                                .map(this::toDTO)
                                .collect(Collectors.toList());
                return ResponseEntity.ok(dtos);
        }

        @Operation(summary = "Get users by license status")
        @GetMapping("/by-license-status/{status}")
        @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
        public ResponseEntity<List<UserDTO>> getUsersByLicenseStatus(@PathVariable String status) {
                LicenseStatus licenseStatus = LicenseStatus.valueOf(status.toUpperCase());
                List<UserEntity> users = userRepository.findByLicenseStatus(licenseStatus);
                List<UserDTO> dtos = users.stream()
                                .map(this::toDTO)
                                .collect(Collectors.toList());
                return ResponseEntity.ok(dtos);
        }

        @Operation(summary = "Approve user's driver license")
        @PutMapping("/{userId}/approve-license")
        @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
        public ResponseEntity<UserDTO> approveLicense(@PathVariable Long userId) {
                log.info("Approving license for user ID: {}", userId);

                UserEntity user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

                user.setLicenseStatus(LicenseStatus.APPROVED);
                userRepository.save(user);

                log.info("License approved for user: {}", user.getEmail());
                return ResponseEntity.ok(toDTO(user));
        }

        @Operation(summary = "Reject user's driver license")
        @PutMapping("/{userId}/reject-license")
        @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
        public ResponseEntity<UserDTO> rejectLicense(@PathVariable Long userId) {
                log.info("Rejecting license for user ID: {}", userId);

                UserEntity user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

                user.setLicenseStatus(LicenseStatus.REJECTED);
                userRepository.save(user);

                log.info("License rejected for user: {}", user.getEmail());
                return ResponseEntity.ok(toDTO(user));
        }

        @Operation(summary = "Update user account status")
        @PutMapping("/{userId}/status")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<UserDTO> updateUserStatus(
                        @PathVariable Long userId,
                        @RequestBody Map<String, String> request) {
                String newStatus = request.get("status");
                log.info("Updating status for user ID: {} to {}", userId, newStatus);

                UserEntity user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

                user.setStatus(newStatus);
                userRepository.save(user);

                return ResponseEntity.ok(toDTO(user));
        }

        private UserDTO toDTO(UserEntity user) {
                return new UserDTO(
                                user.getId(),
                                user.getFullName(),
                                user.getEmail(),
                                user.getPhoneNumber(),
                                user.getRole() != null ? user.getRole().getRoleName() : "ROLE_CUSTOMER",
                                user.getStatus(),
                                user.getLicenseStatus() != null ? user.getLicenseStatus().name() : "NONE",
                                user.getLicenseNumber(),
                                user.getLicenseType(),
                                user.getLicenseFrontImageUrl());
        }

        // Inner DTO class
        public record UserDTO(
                        Long id,
                        String fullName,
                        String email,
                        String phone,
                        String role,
                        String accountStatus,
                        String licenseStatus,
                        String licenseNumber,
                        String licenseType,
                        String licenseFrontImageUrl) {
        }
}
