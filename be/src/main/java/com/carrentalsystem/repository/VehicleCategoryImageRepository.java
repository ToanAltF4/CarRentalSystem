package com.carrentalsystem.repository;

import com.carrentalsystem.entity.VehicleCategoryImageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for VehicleCategoryImage operations.
 */
@Repository
public interface VehicleCategoryImageRepository extends JpaRepository<VehicleCategoryImageEntity, Long> {

    List<VehicleCategoryImageEntity> findByVehicleCategoryIdOrderBySortOrder(Long vehicleCategoryId);

    @Query("SELECT i FROM VehicleCategoryImageEntity i WHERE i.vehicleCategory.id = :categoryId " +
            "ORDER BY i.isPrimary DESC, i.sortOrder ASC, i.id ASC")
    List<VehicleCategoryImageEntity> findByVehicleCategoryIdOrdered(@Param("categoryId") Long categoryId);

    @Query("SELECT i FROM VehicleCategoryImageEntity i WHERE i.vehicleCategory.id IN :categoryIds " +
            "ORDER BY i.vehicleCategory.id ASC, i.isPrimary DESC, i.sortOrder ASC, i.id ASC")
    List<VehicleCategoryImageEntity> findByVehicleCategoryIdInOrdered(@Param("categoryIds") List<Long> categoryIds);

    void deleteByVehicleCategoryId(Long vehicleCategoryId);
}
