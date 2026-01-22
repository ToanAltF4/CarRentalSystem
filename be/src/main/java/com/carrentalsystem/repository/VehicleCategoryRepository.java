package com.carrentalsystem.repository;

import com.carrentalsystem.entity.VehicleCategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for VehicleCategory operations.
 */
@Repository
public interface VehicleCategoryRepository extends JpaRepository<VehicleCategoryEntity, Long> {

    Optional<VehicleCategoryEntity> findByName(String name);

    boolean existsByName(String name);
}
