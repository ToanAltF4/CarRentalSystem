package com.carrentalsystem.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for monthly revenue statistics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyRevenueDTO {
    private Integer year;
    private Integer month;
    private String monthName;
    private BigDecimal revenue;
    private Long bookingCount;
}
