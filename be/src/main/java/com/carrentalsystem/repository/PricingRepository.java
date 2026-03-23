package com.carrentalsystem.repository;

import com.carrentalsystem.entity.PricingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

/**
 * Repository for Pricing operations.
 */
@Repository
public interface PricingRepository extends JpaRepository<PricingEntity, Long> {

        /**
         * Find active pricing for a vehicle category on a specific date.
         * Prioritizes the most recent effective_from date.
         */
        @Query("SELECT p FROM PricingEntity p WHERE p.vehicleCategory.id = :categoryId " +
                        "AND p.isActive = true " +
                        "AND p.effectiveFrom <= :date " +
                        "AND (p.effectiveTo IS NULL OR p.effectiveTo >= :date) " +
                        "ORDER BY p.effectiveFrom DESC")
        Optional<PricingEntity> findActivePricingByCategoryAndDate(
                        @Param("categoryId") Long categoryId,
                        @Param("date") LocalDate date);

        /**
         * Find current active pricing for a vehicle category.
         */
        @Query("SELECT p FROM PricingEntity p WHERE p.vehicleCategory.id = :categoryId " +
                        "AND p.isActive = true " +
                        "AND p.effectiveFrom <= CURRENT_DATE " +
                        "AND (p.effectiveTo IS NULL OR p.effectiveTo >= CURRENT_DATE) " +
                        "ORDER BY p.effectiveFrom DESC")
        Optional<PricingEntity> findCurrentPricingByCategory(@Param("categoryId") Long categoryId);

        /**
         * Find all currently active pricings.
         */
        @Query("SELECT p FROM PricingEntity p WHERE p.isActive = true " +
                        "AND p.effectiveFrom <= CURRENT_DATE " +
                        "AND (p.effectiveTo IS NULL OR p.effectiveTo >= CURRENT_DATE)")
        java.util.List<PricingEntity> findAllCurrentPricings();
}
