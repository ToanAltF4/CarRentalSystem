package com.carrentalsystem.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Response DTO for delivery fee calculation preview.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryFeeResponseDTO {

    private String deliveryAddress;
    private BigDecimal distanceKm;
    private BigDecimal baseFee;
    private BigDecimal freeKm;
    private BigDecimal perKmRate;
    private BigDecimal distanceFee;
    private BigDecimal totalDeliveryFee;

    /**
     * Human-readable breakdown of the fee calculation.
     */
    private String breakdown;
}
