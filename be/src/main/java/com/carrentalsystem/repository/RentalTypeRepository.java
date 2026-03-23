package com.carrentalsystem.repository;

import com.carrentalsystem.entity.RentalTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for RentalType entity.
 * Provides access to rental types (SELF_DRIVE, WITH_DRIVER).
 */
@Repository
public interface RentalTypeRepository extends JpaRepository<RentalTypeEntity, Integer> {

    /**
     * Find rental type by name.
     * 
     * @param name The rental type name (e.g., "SELF_DRIVE", "WITH_DRIVER")
     * @return Optional containing the rental type if found
     */
    Optional<RentalTypeEntity> findByName(String name);
}
