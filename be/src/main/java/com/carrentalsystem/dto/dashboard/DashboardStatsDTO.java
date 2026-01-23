package com.carrentalsystem.dto.dashboard;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for Admin Dashboard Statistics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {

    private BigDecimal totalRevenue;
    private Long totalBookings;
    private Long activeRentals;
    private Long availableVehicles;
    private Long pendingBookings;
    private Long totalVehicles;

    // Recent bookings for activity feed
    private List<RecentBookingDTO> recentBookings;

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
