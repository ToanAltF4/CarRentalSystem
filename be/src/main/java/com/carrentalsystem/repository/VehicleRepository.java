package com.carrentalsystem.repository;

import com.carrentalsystem.entity.VehicleEntity;
import com.carrentalsystem.entity.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for VehicleEntity with JPA Specification support.
 */
@Repository
public interface VehicleRepository extends JpaRepository<VehicleEntity, Long>,
        JpaSpecificationExecutor<VehicleEntity> {

    /**
     * Find vehicle by license plate
     */
    Optional<VehicleEntity> findByLicensePlate(String licensePlate);

    /**
     * Check if license plate already exists
     */
    boolean existsByLicensePlate(String licensePlate);

    /**
     * Find all vehicles by status
     */
    List<VehicleEntity> findByStatus(VehicleStatus status);

    /**
     * Find all vehicles by brand
     */
    List<VehicleEntity> findByBrandIgnoreCase(String brand);

    /**
     * Search vehicles by name or model containing keyword (case-insensitive)
     */
    @Query("SELECT v FROM VehicleEntity v WHERE " +
            "LOWER(v.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(v.model) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(v.brand) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<VehicleEntity> searchByKeyword(@Param("keyword") String keyword);

    /**
     * Get distinct brands for filtering
     */
    @Query("SELECT DISTINCT v.brand FROM VehicleEntity v ORDER BY v.brand")
    List<String> findAllBrands();
}
