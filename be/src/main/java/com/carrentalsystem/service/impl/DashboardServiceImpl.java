package com.carrentalsystem.service.impl;

import com.carrentalsystem.dto.dashboard.DashboardStatsDTO;
import com.carrentalsystem.dto.dashboard.MonthlyRevenueDTO;
import com.carrentalsystem.entity.*;
import com.carrentalsystem.repository.*;
import com.carrentalsystem.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Month;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of Dashboard Service.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

        private final BookingRepository bookingRepository;
        private final VehicleRepository vehicleRepository;
        private final InvoiceRepository invoiceRepository;
        private final com.carrentalsystem.repository.DashboardRepository dashboardRepository;

        @Override
        public DashboardStatsDTO getDashboardStats() {
                try {
                        System.out.println("DEBUG: Starting getDashboardStats (Optimized)");

                        // Execute single aggregated query
                        java.util.Map<String, Object> stats = dashboardRepository.getDashboardStats();

                        BigDecimal totalRevenue = (BigDecimal) stats.get("totalRevenue");
                        long totalBookings = ((Number) stats.get("totalBookings")).longValue();
                        long activeRentals = ((Number) stats.get("activeRentals")).longValue();
                        long pendingBookings = ((Number) stats.get("pendingBookings")).longValue();
                        long availableVehicles = ((Number) stats.get("availableVehicles")).longValue();
                        long totalVehicles = ((Number) stats.get("totalVehicles")).longValue();

                        // Get recent bookings (last 5)
                        List<BookingEntity> recentList = bookingRepository.findRecentBookingsWithVehicle(
                                        org.springframework.data.domain.PageRequest.of(0, 5));

                        List<DashboardStatsDTO.RecentBookingDTO> recentBookings = recentList.stream()
                                        .map(b -> {
                                                BookingEntity.BookingEntityBuilder builder = BookingEntity.builder();
                                                // Used only to avoid unused variable warning if mapping logic changes

                                                return DashboardStatsDTO.RecentBookingDTO.builder()
                                                                .id(b.getId())
                                                                .bookingCode(b.getBookingCode())
                                                                .customerName(b.getCustomerName())
                                                                .vehicleName(b.getVehicle() != null
                                                                                ? b.getVehicle().getName() + " "
                                                                                                + b.getVehicle().getModel()
                                                                                : "Unknown Vehicle")
                                                                .status(b.getStatus() != null ? b.getStatus().name()
                                                                                : "UNKNOWN")
                                                                .createdAt(b.getStartDate() != null ? b.getStartDate()
                                                                                .atStartOfDay().format(
                                                                                                DateTimeFormatter
                                                                                                                .ofPattern("dd/MM/yyyy HH:mm"))
                                                                                : "N/A")
                                                                .build();
                                        })
                                        .collect(Collectors.toList());

                        return DashboardStatsDTO.builder()
                                        .totalRevenue(totalRevenue)
                                        .totalBookings(totalBookings)
                                        .activeRentals(activeRentals)
                                        .pendingBookings(pendingBookings)
                                        .availableVehicles(availableVehicles)
                                        .totalVehicles(totalVehicles)
                                        .recentBookings(recentBookings)
                                        .build();
                } catch (Exception e) {
                        System.err.println("ERROR in getDashboardStats: " + e.getMessage());
                        e.printStackTrace();
                        throw e;
                }
        }

        @Override
        public List<MonthlyRevenueDTO> getMonthlyRevenue(Integer year) {
                // Initialize result with all 12 months set to zero
                List<MonthlyRevenueDTO> result = new ArrayList<>();
                for (int m = 1; m <= 12; m++) {
                        result.add(MonthlyRevenueDTO.builder()
                                        .year(year)
                                        .month(m)
                                        .monthName(Month.of(m).name())
                                        .revenue(BigDecimal.ZERO)
                                        .bookingCount(0L)
                                        .build());
                }

                // Fetch aggregated data from DB
                List<Object[]> aggregatedData = bookingRepository.findMonthlyRevenueByYear(year,
                                BookingStatus.CANCELLED);

                // Update the result list with actual data
                for (Object[] row : aggregatedData) {
                        int month = (int) row[0];
                        BigDecimal revenue = (BigDecimal) row[1];
                        long count = (long) row[2];

                        // Arrays are 0-indexed, months are 1-12
                        MonthlyRevenueDTO dto = result.get(month - 1);
                        dto.setRevenue(revenue != null ? revenue : BigDecimal.ZERO);
                        dto.setBookingCount(count);
                }

                return result;
        }
}
