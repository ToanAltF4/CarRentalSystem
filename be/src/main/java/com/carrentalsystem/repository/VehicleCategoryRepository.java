package com.carrentalsystem.repository;

import com.carrentalsystem.entity.VehicleCategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for VehicleCategory operations.
 */
@Repository
public interface VehicleCategoryRepository extends JpaRepository<VehicleCategoryEntity, Long> {

    Optional<VehicleCategoryEntity> findByBrandAndNameAndModel(String brand, String name, String model);

    boolean existsByBrandAndNameAndModel(String brand, String name, String model);

    List<VehicleCategoryEntity> findAllByOrderByBrandAscNameAsc();

    @Query("SELECT DISTINCT vc.brand FROM VehicleCategoryEntity vc ORDER BY vc.brand")
    List<String> findAllBrands();

    @Query("SELECT DISTINCT vc FROM VehicleCategoryEntity vc LEFT JOIN FETCH vc.images")
    List<VehicleCategoryEntity> findAllWithImages();

    @Query("SELECT DISTINCT vc FROM VehicleCategoryEntity vc LEFT JOIN FETCH vc.images WHERE vc.id = :id")
    Optional<VehicleCategoryEntity> findByIdWithImages(@Param("id") Long id);
}
