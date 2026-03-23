package com.carrentalsystem.repository;

import com.carrentalsystem.entity.DeliveryPricingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for DeliveryPricing entity.
 * Provides access to delivery pricing configuration.
 */
@Repository
public interface DeliveryPricingRepository extends JpaRepository<DeliveryPricingEntity, Long> {

    /**
     * Find the currently active delivery pricing.
     * Returns the first active pricing where current date is within effective
     * range.
     * 
     * @return Optional containing the active delivery pricing if found
     */
    @Query("SELECT dp FROM DeliveryPricingEntity dp WHERE dp.isActive = true " +
            "AND dp.effectiveFrom <= CURRENT_DATE " +
            "AND (dp.effectiveTo IS NULL OR dp.effectiveTo >= CURRENT_DATE) " +
            "ORDER BY dp.effectiveFrom DESC")
    Optional<DeliveryPricingEntity> findCurrentActive();
}
