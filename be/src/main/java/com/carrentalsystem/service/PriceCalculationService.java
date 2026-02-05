package com.carrentalsystem.service;

import com.carrentalsystem.dto.booking.DeliveryFeeResponseDTO;
import com.carrentalsystem.dto.booking.DriverFeeResponseDTO;

import java.math.BigDecimal;

/**
 * Service for calculating rental-related fees.
 */
public interface PriceCalculationService {

    /**
     * Calculate driver fee for WITH_DRIVER rental type (default pricing).
     * 
     * @param totalDays Number of rental days
     * @return DriverFeeResponseDTO with fee breakdown
     */
    DriverFeeResponseDTO calculateDriverFee(int totalDays);

    /**
     * Calculate driver fee for WITH_DRIVER rental type based on vehicle category.
     * 
     * @param totalDays         Number of rental days
     * @param vehicleCategoryId The vehicle category ID for specific pricing
     * @return DriverFeeResponseDTO with fee breakdown
     */
    DriverFeeResponseDTO calculateDriverFeeByCategory(int totalDays, Long vehicleCategoryId);

    /**
     * Calculate delivery fee for DELIVERY pickup method.
     * 
     * @param deliveryAddress The customer's delivery address
     * @return DeliveryFeeResponseDTO with fee breakdown
     */
    DeliveryFeeResponseDTO calculateDeliveryFee(String deliveryAddress);

    /**
     * Get the current active driver daily fee.
     * 
     * @return Daily driver fee amount
     */
    BigDecimal getDriverDailyFee();

    /**
     * Get driver daily fee for a specific vehicle category.
     * 
     * @param vehicleCategoryId The category ID
     * @return Daily driver fee amount for the category
     */
    BigDecimal getDriverDailyFeeByCategory(Long vehicleCategoryId);

    /**
     * Get the current active delivery base fee.
     * 
     * @return Base delivery fee amount
     */
    BigDecimal getDeliveryBaseFee();
}
