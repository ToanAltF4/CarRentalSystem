package com.carrentalsystem.repository;

import com.carrentalsystem.entity.PickupMethodEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for PickupMethod entity.
 * Provides access to pickup methods (STORE, DELIVERY).
 */
@Repository
public interface PickupMethodRepository extends JpaRepository<PickupMethodEntity, Integer> {

    /**
     * Find pickup method by name.
     * 
     * @param name The pickup method name (e.g., "STORE", "DELIVERY")
     * @return Optional containing the pickup method if found
     */
    Optional<PickupMethodEntity> findByName(String name);
}
