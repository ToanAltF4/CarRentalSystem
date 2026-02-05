package com.carrentalsystem.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Response DTO for driver fee calculation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverFeeResponseDTO {

    private BigDecimal dailyFee;
    private Integer totalDays;
    private BigDecimal totalDriverFee;

    /**
     * Human-readable breakdown of the fee calculation.
     */
    private String breakdown;
}
