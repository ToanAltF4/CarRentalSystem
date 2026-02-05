package com.carrentalsystem.controller;

import com.carrentalsystem.dto.user.UserRequestDTO;
import com.carrentalsystem.dto.user.UserResponseDTO;
import com.carrentalsystem.entity.LicenseStatus;
import com.carrentalsystem.entity.UserEntity;
import com.carrentalsystem.repository.UserRepository;
import com.carrentalsystem.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin User Management Controller
 * Full CRUD operations for users + license management
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@Tag(name = "Admin User Management", description = "CRUD operations for users")
public class AdminUserController {

        private final UserService userService;
        private final UserRepository userRepository;

        // ==================== CRUD Operations ====================

        @Operation(summary = "Create a new user")
        @PostMapping
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody UserRequestDTO request) {
                log.info("Creating user with email: {}", request.getEmail());
                UserResponseDTO created = userService.createUser(request);
                return ResponseEntity.status(HttpStatus.CREATED).body(created);
        }

        @Operation(summary = "Get user by ID")
        @GetMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
        public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
                return ResponseEntity.ok(userService.getUserById(id));
        }

        @Operation(summary = "Get all users")
        @GetMapping
        @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
        public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
                return ResponseEntity.ok(userService.getAllUsers());
        }

        @Operation(summary = "Get users by role")
        @GetMapping("/by-role/{roleName}")
        @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
        public ResponseEntity<List<UserResponseDTO>> getUsersByRole(@PathVariable String roleName) {
                return ResponseEntity.ok(userService.getUsersByRole(roleName));
        }

        @Operation(summary = "Update user")
        @PutMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<UserResponseDTO> updateUser(
                        @PathVariable Long id,
                        @Valid @RequestBody UserRequestDTO request) {
                log.info("Updating user ID: {}", id);
                return ResponseEntity.ok(userService.updateUser(id, request));
        }

        @Operation(summary = "Delete user")
        @DeleteMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
                log.info("Deleting user ID: {}", id);
                userService.deleteUser(id);
                return ResponseEntity.noContent().build();
        }

        @Operation(summary = "Toggle user status (ACTIVE/INACTIVE)")
        @PatchMapping("/{id}/toggle-status")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<UserResponseDTO> toggleUserStatus(@PathVariable Long id) {
                return ResponseEntity.ok(userService.toggleUserStatus(id));
        }

        // ==================== License Management ====================

        @Operation(summary = "Get users by license status")
        @GetMapping("/by-license-status/{status}")
        @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
        public ResponseEntity<List<UserResponseDTO>> getUsersByLicenseStatus(@PathVariable String status) {
                LicenseStatus licenseStatus = LicenseStatus.valueOf(status.toUpperCase());
                List<UserEntity> users = userRepository.findByLicenseStatus(licenseStatus);
                List<UserResponseDTO> dtos = users.stream()
                                .map(this::toResponseDTO)
                                .toList();
                return ResponseEntity.ok(dtos);
        }

        @Operation(summary = "Approve user's driver license")
        @PutMapping("/{userId}/approve-license")
        @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
        public ResponseEntity<UserResponseDTO> approveLicense(@PathVariable Long userId) {
                log.info("Approving license for user ID: {}", userId);

                UserEntity user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

                user.setLicenseStatus(LicenseStatus.APPROVED);
                userRepository.save(user);

                return ResponseEntity.ok(toResponseDTO(user));
        }

        @Operation(summary = "Reject user's driver license")
        @PutMapping("/{userId}/reject-license")
        @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
        public ResponseEntity<UserResponseDTO> rejectLicense(@PathVariable Long userId) {
                log.info("Rejecting license for user ID: {}", userId);

                UserEntity user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

                user.setLicenseStatus(LicenseStatus.REJECTED);
                userRepository.save(user);

                return ResponseEntity.ok(toResponseDTO(user));
        }

        // ==================== Helper ====================

        private UserResponseDTO toResponseDTO(UserEntity user) {
                return UserResponseDTO.builder()
                                .id(user.getId())
                                .fullName(user.getFullName())
                                .email(user.getEmail())
                                .phone(user.getPhoneNumber())
                                .status(user.getStatus())
                                .roleId(user.getRole() != null ? user.getRole().getId() : null)
                                .roleName(user.getRole() != null ? user.getRole().getRoleName() : null)
                                .licenseStatus(user.getLicenseStatus() != null ? user.getLicenseStatus().name() : null)
                                .licenseType(user.getLicenseType())
                                .licenseNumber(user.getLicenseNumber())
                                .dateOfBirth(user.getDateOfBirth())
                                .licenseFrontImageUrl(user.getLicenseFrontImageUrl())
                                .driverStatus(user.getDriverStatus())
                                .driverAvailable(user.getDriverAvailable())
                                .build();
        }
}
