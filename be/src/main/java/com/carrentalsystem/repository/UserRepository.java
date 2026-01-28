package com.carrentalsystem.repository;

import com.carrentalsystem.entity.LicenseStatus;
import com.carrentalsystem.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for UserEntity operations.
 * Provides methods for authentication and user management.
 */
@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    /**
     * Find user by email - used for login authentication
     */
    Optional<UserEntity> findByEmail(String email);

    /**
     * Check if email already exists - used during registration
     */
    boolean existsByEmail(String email);

    /**
     * Find users by license status - for admin management
     */
    List<UserEntity> findByLicenseStatus(LicenseStatus licenseStatus);
}
