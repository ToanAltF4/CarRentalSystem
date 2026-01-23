package com.carrentalsystem.dto.dashboard;

import lombok.*;
import java.math.BigDecimal;

/**
 * DTO for Monthly Revenue data (for charts).
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
