package com.carrentalsystem.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for combined dashboard payload.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardOverviewDTO {
    private DashboardStatsDTO stats;
    private List<MonthlyRevenueDTO> monthlyRevenue;
}
