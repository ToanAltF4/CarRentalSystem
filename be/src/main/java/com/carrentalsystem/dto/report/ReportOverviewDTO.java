package com.carrentalsystem.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportOverviewDTO {
    private BigDecimal totalRevenue;
    private Long totalBookings;
    private Long completedBookings;
    private Long cancelledBookings;
    private List<BookingStatusBreakdownDTO> statusBreakdown;
    private List<RevenueByCategoryDTO> revenueByCategory;
    private List<TopVehicleDTO> topVehicles;
    private List<DailyBookingTrendDTO> dailyTrend;
}
