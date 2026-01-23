package com.carrentalsystem.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for dashboard statistics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {

    private BigDecimal totalRevenue;
    private Long totalBookings;
    private Long activeRentals;
    private Long pendingBookings;
    private Long availableVehicles;
    private Long totalVehicles;
    private List<RecentBookingDTO> recentBookings;

    /**
     * Nested DTO for recent booking summary.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentBookingDTO {
        private Long id;
        private String bookingCode;
        private String customerName;
        private String vehicleName;
        private String status;
        private String createdAt;
    }
}
