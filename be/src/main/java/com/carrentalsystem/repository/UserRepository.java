package com.carrentalsystem.repository;

import com.carrentalsystem.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for UserEntity operations.
 * Provides methods for authentication and user management.
 */
@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    /**
     * Find user by username - used for login authentication
     */
    Optional<UserEntity> findByUsername(String username);

    /**
     * Find user by email - used for email verification and password recovery
     */
    Optional<UserEntity> findByEmail(String email);

    /**
     * Check if username already exists - used during registration
     */
    boolean existsByUsername(String username);

    /**
     * Check if email already exists - used during registration
     */
    boolean existsByEmail(String email);
}
