package com.carrentalsystem.service;

import com.carrentalsystem.dto.user.UserRequestDTO;
import com.carrentalsystem.dto.user.UserResponseDTO;

import java.util.List;

/**
 * Service interface for User CRUD operations
 */
public interface UserService {

    /**
     * Create a new user
     */
    UserResponseDTO createUser(UserRequestDTO request);

    /**
     * Get user by ID
     */
    UserResponseDTO getUserById(Long id);

    /**
     * Get all users
     */
    List<UserResponseDTO> getAllUsers();

    /**
     * Get users by role
     */
    List<UserResponseDTO> getUsersByRole(String roleName);

    /**
     * Update user
     */
    UserResponseDTO updateUser(Long id, UserRequestDTO request);

    /**
     * Delete user
     */
    void deleteUser(Long id);

    /**
     * Toggle user status (ACTIVE/INACTIVE)
     */
    UserResponseDTO toggleUserStatus(Long id);
}
