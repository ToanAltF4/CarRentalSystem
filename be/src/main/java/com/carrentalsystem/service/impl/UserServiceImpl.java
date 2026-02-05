package com.carrentalsystem.service.impl;

import com.carrentalsystem.dto.user.UserRequestDTO;
import com.carrentalsystem.dto.user.UserResponseDTO;
import com.carrentalsystem.entity.RoleEntity;
import com.carrentalsystem.entity.UserEntity;
import com.carrentalsystem.exception.ResourceNotFoundException;
import com.carrentalsystem.repository.RoleRepository;
import com.carrentalsystem.repository.UserRepository;
import com.carrentalsystem.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of UserService for CRUD operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponseDTO createUser(UserRequestDTO request) {
        log.info("Creating new user with email: {}", request.getEmail());

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + request.getEmail());
        }

        // Build user entity
        UserEntity user = UserEntity.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .status("ACTIVE")
                .licenseType(request.getLicenseType())
                .licenseNumber(request.getLicenseNumber())
                .build();

        // Set role
        if (request.getRoleId() != null) {
            RoleEntity role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role", "id", request.getRoleId()));
            user.setRole(role);
        } else {
            // Default to ROLE_CUSTOMER
            roleRepository.findByRoleName("ROLE_CUSTOMER")
                    .ifPresent(user::setRole);
        }

        UserEntity saved = userRepository.save(user);
        log.info("User created successfully with ID: {}", saved.getId());

        return toResponseDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getUserById(Long id) {
        UserEntity user = findUserOrThrow(id);
        return toResponseDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> getUsersByRole(String roleName) {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && roleName.equals(u.getRole().getRoleName()))
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponseDTO updateUser(Long id, UserRequestDTO request) {
        log.info("Updating user with ID: {}", id);

        UserEntity user = findUserOrThrow(id);

        // Update fields if provided
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already exists: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }
        if (request.getLicenseType() != null) {
            user.setLicenseType(request.getLicenseType());
        }
        if (request.getLicenseNumber() != null) {
            user.setLicenseNumber(request.getLicenseNumber());
        }
        if (request.getRoleId() != null) {
            RoleEntity role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role", "id", request.getRoleId()));
            user.setRole(role);
        }

        UserEntity saved = userRepository.save(user);
        log.info("User updated successfully: {}", saved.getEmail());

        return toResponseDTO(saved);
    }

    @Override
    public void deleteUser(Long id) {
        log.info("Deleting user with ID: {}", id);

        UserEntity user = findUserOrThrow(id);
        userRepository.delete(user);

        log.info("User deleted successfully: {}", user.getEmail());
    }

    @Override
    public UserResponseDTO toggleUserStatus(Long id) {
        UserEntity user = findUserOrThrow(id);

        String newStatus = "ACTIVE".equals(user.getStatus()) ? "INACTIVE" : "ACTIVE";
        user.setStatus(newStatus);

        UserEntity saved = userRepository.save(user);
        log.info("User status toggled to {} for ID: {}", newStatus, id);

        return toResponseDTO(saved);
    }

    // ==================== Helper Methods ====================

    private UserEntity findUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

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
