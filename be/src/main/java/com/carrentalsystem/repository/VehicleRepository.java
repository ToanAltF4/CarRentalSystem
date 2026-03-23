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

        interface VehicleCategoryCountProjection {
                Long getCategoryId();

                Long getTotalCount();

                Long getAvailableCount();
        }

        /**
         * Find vehicle by license plate
         */
        Optional<VehicleEntity> findByLicensePlate(String licensePlate);

        @Query("SELECT DISTINCT v FROM VehicleEntity v " +
                        "LEFT JOIN FETCH v.vehicleCategory vc " +
                        "LEFT JOIN FETCH vc.images " +
                        "WHERE v.id = :id")
        Optional<VehicleEntity> findByIdWithCategory(@Param("id") Long id);

        /**
         * Check if license plate already exists
         */
        boolean existsByLicensePlate(String licensePlate);

        /**
         * Check if VIN already exists
         */
        boolean existsByVin(String vin);

        /**
         * Find all vehicles by status
         */
        List<VehicleEntity> findByStatus(VehicleStatus status);

        long countByStatus(VehicleStatus status);

        /**
         * Find vehicles by category
         */
        List<VehicleEntity> findByVehicleCategoryId(Long vehicleCategoryId);

        long countByVehicleCategoryId(Long vehicleCategoryId);

        long countByVehicleCategoryIdAndStatus(Long vehicleCategoryId, VehicleStatus status);

        /**
         * Fetch all vehicles with category eagerly loaded
         */
        @Query("SELECT DISTINCT v FROM VehicleEntity v " +
                        "LEFT JOIN FETCH v.vehicleCategory vc " +
                        "LEFT JOIN FETCH vc.images")
        List<VehicleEntity> findAllWithCategory();

        @Query("SELECT DISTINCT v FROM VehicleEntity v " +
                        "LEFT JOIN FETCH v.vehicleCategory vc " +
                        "LEFT JOIN FETCH vc.images " +
                        "WHERE vc.id = :categoryId")
        List<VehicleEntity> findByVehicleCategoryIdWithCategory(@Param("categoryId") Long categoryId);

        /**
         * Fetch vehicles by status with category eagerly loaded
         */
        @Query("SELECT DISTINCT v FROM VehicleEntity v " +
                        "LEFT JOIN FETCH v.vehicleCategory vc " +
                        "LEFT JOIN FETCH vc.images " +
                        "WHERE v.status = :status")
        List<VehicleEntity> findByStatusWithCategory(@Param("status") VehicleStatus status);

        /**
         * Search by license plate or VIN
         */
        @Query("SELECT DISTINCT v FROM VehicleEntity v " +
                        "LEFT JOIN FETCH v.vehicleCategory vc " +
                        "LEFT JOIN FETCH vc.images " +
                        "WHERE LOWER(v.licensePlate) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                        "LOWER(v.vin) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                        "LOWER(vc.brand) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                        "LOWER(vc.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
        List<VehicleEntity> searchByKeyword(@Param("keyword") String keyword);

        @Query("""
                        SELECT
                            v.vehicleCategory.id AS categoryId,
                            COUNT(v) AS totalCount,
                            SUM(CASE WHEN v.status = :availableStatus THEN 1 ELSE 0 END) AS availableCount
                        FROM VehicleEntity v
                        GROUP BY v.vehicleCategory.id
                        """)
        List<VehicleCategoryCountProjection> countVehiclesByCategory(
                        @Param("availableStatus") VehicleStatus availableStatus);
}
