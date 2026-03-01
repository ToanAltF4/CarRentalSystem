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
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Implementation of PriceCalculationService.
 * Handles calculation of driver fees and delivery fees.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(propagation = Propagation.NOT_SUPPORTED, readOnly = true)
public class PriceCalculationServiceImpl implements PriceCalculationService {

    private final DriverPricingRepository driverPricingRepository;
    private final DeliveryPricingRepository deliveryPricingRepository;

    // Default values if no pricing found in database
    private static final BigDecimal DEFAULT_DRIVER_DAILY_FEE = BigDecimal.valueOf(500000); // 500k VND/day
    private static final BigDecimal DEFAULT_DELIVERY_BASE_FEE = BigDecimal.valueOf(50000); // 50k VND base

    // Delivery fee calculation constants
    private static final BigDecimal FREE_KM = BigDecimal.valueOf(5); // First 5 km free
    private static final BigDecimal PER_KM_RATE = BigDecimal.valueOf(5000); // 5000 VND per km after free distance

    @Override
    public DriverFeeResponseDTO calculateDriverFee(int totalDays) {
        BigDecimal dailyFee = getDriverDailyFee();
        BigDecimal totalDriverFee = dailyFee.multiply(BigDecimal.valueOf(totalDays));

        String breakdown = String.format("%s x %d days = %s",
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

        String breakdown = String.format("%s x %d days = %s",
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
        BigDecimal distanceKm = calculateDistance(deliveryAddress);
        return calculateDeliveryFee(deliveryAddress, distanceKm);
    }

    @Override
    public DeliveryFeeResponseDTO calculateDeliveryFee(String deliveryAddress, BigDecimal distanceKm) {
        return calculateDeliveryFee(deliveryAddress, distanceKm, false);
    }

    @Override
    public DeliveryFeeResponseDTO calculateDeliveryFee(String deliveryAddress, BigDecimal distanceKm,
            boolean withDriver) {
        if (distanceKm == null || distanceKm.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Distance must be greater than 0 km");
        }

        BigDecimal normalizedDistance = distanceKm.setScale(2, RoundingMode.HALF_UP);
        BigDecimal baseFee = getDeliveryBaseFee();
        BigDecimal perKmRate = getDeliveryPerKmFee();

        BigDecimal chargeableDistance = normalizedDistance.subtract(FREE_KM).max(BigDecimal.ZERO);
        BigDecimal distanceFee = chargeableDistance.multiply(perKmRate);

        BigDecimal totalDeliveryFee;
        String breakdown;

        if (withDriver) {
            // WITH_DRIVER: within free km = FREE, beyond = only per-km surcharge (no base
            // fee)
            if (normalizedDistance.compareTo(FREE_KM) <= 0) {
                totalDeliveryFee = BigDecimal.ZERO;
                breakdown = String.format("Distance %.2f km (within free pickup radius of %s km). Pickup fee: FREE",
                        normalizedDistance, FREE_KM.intValue());
            } else {
                totalDeliveryFee = distanceFee;
                breakdown = String.format("Distance %.2f km. Pickup surcharge: (%.2f km x %s) = %s",
                        normalizedDistance, chargeableDistance, formatCurrency(perKmRate),
                        formatCurrency(totalDeliveryFee));
            }
        } else {
            // SELF_DRIVE delivery: always base fee + distance surcharge
            totalDeliveryFee = baseFee.add(distanceFee);
            if (normalizedDistance.compareTo(FREE_KM) <= 0) {
                breakdown = String.format("Distance %.2f km (within free radius of %s km). Base fee: %s",
                        normalizedDistance, FREE_KM.intValue(), formatCurrency(baseFee));
            } else {
                breakdown = String.format("Distance %.2f km. Base fee: %s + (%.2f km x %s) = %s",
                        normalizedDistance, formatCurrency(baseFee), chargeableDistance, formatCurrency(perKmRate),
                        formatCurrency(totalDeliveryFee));
            }
        }

        log.info("Calculated delivery fee (withDriver={}): {} for address: {}, distance: {} km",
                withDriver, totalDeliveryFee, deliveryAddress, normalizedDistance);

        return DeliveryFeeResponseDTO.builder()
                .deliveryAddress(deliveryAddress)
                .distanceKm(normalizedDistance)
                .baseFee(withDriver ? BigDecimal.ZERO : baseFee)
                .freeKm(FREE_KM)
                .perKmRate(perKmRate)
                .distanceFee(distanceFee)
                .totalDeliveryFee(totalDeliveryFee)
                .breakdown(breakdown)
                .build();
    }

    @Override
    public BigDecimal getDriverDailyFee() {
        try {
            return driverPricingRepository.findCurrentActive()
                    .map(DriverPricingEntity::getDailyFee)
                    .orElseGet(() -> {
                        log.warn("No active driver pricing found, using default: {}", DEFAULT_DRIVER_DAILY_FEE);
                        return DEFAULT_DRIVER_DAILY_FEE;
                    });
        } catch (Exception ex) {
            log.error("Failed to load driver pricing from DB, using default: {}", DEFAULT_DRIVER_DAILY_FEE, ex);
            return DEFAULT_DRIVER_DAILY_FEE;
        }
    }

    @Override
    public BigDecimal getDriverDailyFeeByCategory(Long vehicleCategoryId) {
        if (vehicleCategoryId == null) {
            return getDriverDailyFee();
        }

        try {
            return driverPricingRepository.findCurrentActiveByCategory(vehicleCategoryId)
                    .map(DriverPricingEntity::getDailyFee)
                    .orElseGet(() -> {
                        log.warn("No driver pricing found for category {}, falling back to default", vehicleCategoryId);
                        return getDriverDailyFee();
                    });
        } catch (Exception ex) {
            log.error("Failed to load driver pricing for category {}, falling back to default", vehicleCategoryId, ex);
            return getDriverDailyFee();
        }
    }

    @Override
    public BigDecimal getDeliveryBaseFee() {
        try {
            return deliveryPricingRepository.findCurrentActive()
                    .map(DeliveryPricingEntity::getBaseFee)
                    .orElseGet(() -> {
                        log.warn("No active delivery pricing found, using default: {}", DEFAULT_DELIVERY_BASE_FEE);
                        return DEFAULT_DELIVERY_BASE_FEE;
                    });
        } catch (Exception ex) {
            log.error("Failed to load delivery base fee from DB, using default: {}", DEFAULT_DELIVERY_BASE_FEE, ex);
            return DEFAULT_DELIVERY_BASE_FEE;
        }
    }

    /**
     * Get per-km delivery fee from database.
     */
    private BigDecimal getDeliveryPerKmFee() {
        try {
            return deliveryPricingRepository.findCurrentActive()
                    .map(DeliveryPricingEntity::getPerKmFee)
                    .orElseGet(() -> {
                        log.warn("No active delivery per-km pricing found, using default: {}", PER_KM_RATE);
                        return PER_KM_RATE;
                    });
        } catch (Exception ex) {
            log.error("Failed to load delivery per-km fee from DB, using default: {}", PER_KM_RATE, ex);
            return PER_KM_RATE;
        }
    }

    /**
     * Deterministic fallback distance when no client-side route distance is
     * provided.
     */
    private BigDecimal calculateDistance(String deliveryAddress) {
        if (deliveryAddress == null || deliveryAddress.isBlank()) {
            return BigDecimal.ONE.setScale(2, RoundingMode.HALF_UP);
        }

        String normalized = deliveryAddress.trim().toLowerCase();
        int bucket = Math.floorMod(normalized.hashCode(), 14); // 0..13
        double baseDistance = 2.0 + bucket; // 2..15 km
        return BigDecimal.valueOf(baseDistance).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Format currency for display (VND).
     */
    private String formatCurrency(BigDecimal amount) {
        return String.format("%,.0f VND", amount);
    }
}
