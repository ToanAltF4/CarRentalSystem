package com.carrentalsystem.repository;

import com.carrentalsystem.entity.VehicleCategoryImageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for VehicleCategoryImage operations.
 */
@Repository
public interface VehicleCategoryImageRepository extends JpaRepository<VehicleCategoryImageEntity, Long> {

    List<VehicleCategoryImageEntity> findByVehicleCategoryIdOrderBySortOrder(Long vehicleCategoryId);

    void deleteByVehicleCategoryId(Long vehicleCategoryId);
}
