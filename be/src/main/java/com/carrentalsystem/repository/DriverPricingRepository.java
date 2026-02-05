package com.carrentalsystem.repository;

import com.carrentalsystem.entity.DriverPricingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for DriverPricing entity.
 * Provides access to driver pricing configuration.
 */
@Repository
public interface DriverPricingRepository extends JpaRepository<DriverPricingEntity, Long> {

        /**
         * Find the currently active driver pricing (legacy - returns first found).
         * 
         * @return Optional containing the active driver pricing if found
         */
        @Query("SELECT dp FROM DriverPricingEntity dp WHERE dp.isActive = true " +
                        "AND dp.vehicleCategory IS NULL " +
                        "AND dp.effectiveFrom <= CURRENT_DATE " +
                        "AND (dp.effectiveTo IS NULL OR dp.effectiveTo >= CURRENT_DATE) " +
                        "ORDER BY dp.effectiveFrom DESC")
        Optional<DriverPricingEntity> findCurrentActive();

        /**
         * Find the currently active driver pricing for a specific vehicle category.
         * 
         * @param categoryId the vehicle category ID
         * @return Optional containing the active driver pricing for the category
         */
        @Query("SELECT dp FROM DriverPricingEntity dp WHERE dp.isActive = true " +
                        "AND dp.vehicleCategory.id = :categoryId " +
                        "AND dp.effectiveFrom <= CURRENT_DATE " +
                        "AND (dp.effectiveTo IS NULL OR dp.effectiveTo >= CURRENT_DATE) " +
                        "ORDER BY dp.effectiveFrom DESC")
        Optional<DriverPricingEntity> findCurrentActiveByCategory(@Param("categoryId") Long categoryId);
}
