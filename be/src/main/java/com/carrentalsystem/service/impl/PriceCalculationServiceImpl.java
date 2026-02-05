package com.carrentalsystem.service.impl;

import com.carrentalsystem.dto.booking.DeliveryFeeResponseDTO;
import com.carrentalsystem.dto.booking.DriverFeeResponseDTO;
import com.carrentalsystem.entity.DeliveryPricingEntity;
import com.carrentalsystem.entity.DriverPricingEntity;
import com.carrentalsystem.repository.DeliveryPricingRepository;
import com.carrentalsystem.repository.DriverPricingRepository;
import com.carrentalsystem.service.PriceCalculationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Random;

/**
 * Implementation of PriceCalculationService.
 * Handles calculation of driver fees and delivery fees.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PriceCalculationServiceImpl implements PriceCalculationService {

    private final DriverPricingRepository driverPricingRepository;
    private final DeliveryPricingRepository deliveryPricingRepository;

    // Default values if no pricing found in database
    private static final BigDecimal DEFAULT_DRIVER_DAILY_FEE = BigDecimal.valueOf(500000); // 500k VND/day
    private static final BigDecimal DEFAULT_DELIVERY_BASE_FEE = BigDecimal.valueOf(50000); // 50k VND base

    // Delivery fee calculation constants
    private static final BigDecimal FREE_KM = BigDecimal.valueOf(5); // First 5km free
    private static final BigDecimal PER_KM_RATE = BigDecimal.valueOf(5000); // 5000 VND per km after free distance

    // Store location (for demo purposes - Ho Chi Minh City center)
    private static final double STORE_LATITUDE = 10.7769;
    private static final double STORE_LONGITUDE = 106.7009;

    @Override
    public DriverFeeResponseDTO calculateDriverFee(int totalDays) {
        BigDecimal dailyFee = getDriverDailyFee();
        BigDecimal totalDriverFee = dailyFee.multiply(BigDecimal.valueOf(totalDays));

        String breakdown = String.format("%s × %d days = %s",
                formatCurrency(dailyFee), totalDays, formatCurrency(totalDriverFee));

        log.info("Calculated driver fee: {} for {} days", totalDriverFee, totalDays);

        return DriverFeeResponseDTO.builder()
                .dailyFee(dailyFee)
                .totalDays(totalDays)
                .totalDriverFee(totalDriverFee)
                .breakdown(breakdown)
                .build();
    }

    @Override
    public DriverFeeResponseDTO calculateDriverFeeByCategory(int totalDays, Long vehicleCategoryId) {
        BigDecimal dailyFee = getDriverDailyFeeByCategory(vehicleCategoryId);
        BigDecimal totalDriverFee = dailyFee.multiply(BigDecimal.valueOf(totalDays));

        String breakdown = String.format("%s × %d days = %s",
                formatCurrency(dailyFee), totalDays, formatCurrency(totalDriverFee));

        log.info("Calculated driver fee by category {}: {} for {} days", vehicleCategoryId, totalDriverFee, totalDays);

        return DriverFeeResponseDTO.builder()
                .dailyFee(dailyFee)
                .totalDays(totalDays)
                .totalDriverFee(totalDriverFee)
                .breakdown(breakdown)
                .build();
    }

    @Override
    public DeliveryFeeResponseDTO calculateDeliveryFee(String deliveryAddress) {
        BigDecimal baseFee = getDeliveryBaseFee();
        BigDecimal perKmRate = getDeliveryPerKmFee();
        BigDecimal distanceKm = calculateDistance(deliveryAddress);

        // Calculate distance fee: max(0, distance - free_km) * per_km_rate
        BigDecimal chargeableDistance = distanceKm.subtract(FREE_KM).max(BigDecimal.ZERO);
        BigDecimal distanceFee = chargeableDistance.multiply(perKmRate);
        BigDecimal totalDeliveryFee = baseFee.add(distanceFee);

        String breakdown;
        if (distanceKm.compareTo(FREE_KM) <= 0) {
            breakdown = String.format("Distance %.1f km (within free radius of %s km). Base fee: %s",
                    distanceKm, FREE_KM.intValue(), formatCurrency(baseFee));
        } else {
            breakdown = String.format("Distance %.1f km. Base fee: %s + (%.1f km × %s) = %s",
                    distanceKm, formatCurrency(baseFee), chargeableDistance, formatCurrency(perKmRate),
                    formatCurrency(totalDeliveryFee));
        }

        log.info("Calculated delivery fee: {} for address: {}, distance: {} km",
                totalDeliveryFee, deliveryAddress, distanceKm);

        return DeliveryFeeResponseDTO.builder()
                .deliveryAddress(deliveryAddress)
                .distanceKm(distanceKm)
                .baseFee(baseFee)
                .freeKm(FREE_KM)
                .perKmRate(perKmRate)
                .distanceFee(distanceFee)
                .totalDeliveryFee(totalDeliveryFee)
                .breakdown(breakdown)
                .build();
    }

    @Override
    public BigDecimal getDriverDailyFee() {
        return driverPricingRepository.findCurrentActive()
                .map(DriverPricingEntity::getDailyFee)
                .orElseGet(() -> {
                    log.warn("No active driver pricing found, using default: {}", DEFAULT_DRIVER_DAILY_FEE);
                    return DEFAULT_DRIVER_DAILY_FEE;
                });
    }

    @Override
    public BigDecimal getDriverDailyFeeByCategory(Long vehicleCategoryId) {
        if (vehicleCategoryId == null) {
            return getDriverDailyFee();
        }

        return driverPricingRepository.findCurrentActiveByCategory(vehicleCategoryId)
                .map(DriverPricingEntity::getDailyFee)
                .orElseGet(() -> {
                    log.warn("No driver pricing found for category {}, falling back to default", vehicleCategoryId);
                    return getDriverDailyFee();
                });
    }

    @Override
    public BigDecimal getDeliveryBaseFee() {
        return deliveryPricingRepository.findCurrentActive()
                .map(DeliveryPricingEntity::getBaseFee)
                .orElseGet(() -> {
                    log.warn("No active delivery pricing found, using default: {}", DEFAULT_DELIVERY_BASE_FEE);
                    return DEFAULT_DELIVERY_BASE_FEE;
                });
    }

    /**
     * Get per-km delivery fee from database.
     */
    private BigDecimal getDeliveryPerKmFee() {
        return deliveryPricingRepository.findCurrentActive()
                .map(DeliveryPricingEntity::getPerKmFee)
                .orElse(PER_KM_RATE);
    }

    /**
     * Calculate distance from store to delivery address.
     * This is a SIMULATED distance calculation for demo purposes.
     * In production, integrate with Google Maps Distance Matrix API or similar.
     * 
     * @param deliveryAddress The customer's delivery address
     * @return Calculated distance in kilometers
     */
    private BigDecimal calculateDistance(String deliveryAddress) {
        // Simulated distance calculation based on address keywords
        // In production, use actual geocoding + distance matrix API

        String addressLower = deliveryAddress.toLowerCase();
        double baseDistance;

        // Simulate distances based on district names (Ho Chi Minh City)
        if (addressLower.contains("quận 1") || addressLower.contains("district 1") || addressLower.contains("q1")) {
            baseDistance = 2.0; // Very close to center
        } else if (addressLower.contains("quận 3") || addressLower.contains("q3") ||
                addressLower.contains("quận 5") || addressLower.contains("q5") ||
                addressLower.contains("quận 10") || addressLower.contains("q10")) {
            baseDistance = 4.0; // Close
        } else if (addressLower.contains("tân bình") || addressLower.contains("bình thạnh") ||
                addressLower.contains("phú nhuận") || addressLower.contains("gò vấp")) {
            baseDistance = 6.0; // Medium distance
        } else if (addressLower.contains("thủ đức") || addressLower.contains("quận 7") ||
                addressLower.contains("q7") || addressLower.contains("quận 2") || addressLower.contains("q2")) {
            baseDistance = 10.0; // Further
        } else if (addressLower.contains("bình chánh") || addressLower.contains("hóc môn") ||
                addressLower.contains("củ chi") || addressLower.contains("cần giờ")) {
            baseDistance = 20.0; // Far suburbs
        } else {
            // Default: random distance between 3-15 km
            baseDistance = 3.0 + new Random().nextDouble() * 12.0;
        }

        // Add slight randomness for variation
        double variation = (new Random().nextDouble() - 0.5) * 2.0; // ±1 km
        double finalDistance = Math.max(1.0, baseDistance + variation);

        return BigDecimal.valueOf(finalDistance).setScale(1, RoundingMode.HALF_UP);
    }

    /**
     * Format currency for display (VND).
     */
    private String formatCurrency(BigDecimal amount) {
        return String.format("%,.0f₫", amount);
    }
}
