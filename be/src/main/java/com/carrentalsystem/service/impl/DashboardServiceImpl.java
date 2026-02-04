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

        @Override
        public DashboardStatsDTO getDashboardStats() {
                try {
                        System.out.println("DEBUG: Starting getDashboardStats");
                        // Calculate total revenue from all paid invoices
                        BigDecimal totalRevenue = invoiceRepository.sumTotalAmountByPaymentStatus(PaymentStatus.PAID);
                        System.out.println("DEBUG: Total Revenue: " + totalRevenue);
                        if (totalRevenue == null) {
                                totalRevenue = BigDecimal.ZERO;
                        }

                        // Count total bookings
                        long totalBookings = bookingRepository.count();
                        System.out.println("DEBUG: Total Bookings: " + totalBookings);

                        // Count active rentals (IN_PROGRESS status)
                        long activeRentals = bookingRepository.countByStatus(BookingStatus.IN_PROGRESS);
                        System.out.println("DEBUG: Active Rentals: " + activeRentals);

                        // Count pending bookings
                        long pendingBookings = bookingRepository.countByStatus(BookingStatus.PENDING);
                        System.out.println("DEBUG: Pending Bookings: " + pendingBookings);

                        // Count available vehicles
                        long availableVehicles = vehicleRepository.countByStatus(VehicleStatus.AVAILABLE);
                        System.out.println("DEBUG: Available Vehicles: " + availableVehicles);

                        // Count total vehicles
                        long totalVehicles = vehicleRepository.count();
                        System.out.println("DEBUG: Total Vehicles: " + totalVehicles);

                        // Get recent bookings (last 5)
                        System.out.println("DEBUG: Fetching recent bookings...");
                        List<BookingEntity> recentList = bookingRepository.findRecentBookingsWithVehicle(
                                        org.springframework.data.domain.PageRequest.of(0, 5));
                        System.out.println("DEBUG: Fetched " + (recentList != null ? recentList.size() : "null")
                                        + " recent bookings");

                        List<DashboardStatsDTO.RecentBookingDTO> recentBookings = recentList.stream()
                                        .map(b -> {
                                                System.out.println("DEBUG: Mapping booking " + b.getId());
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
                List<MonthlyRevenueDTO> result = new ArrayList<>();

                // Get all bookings for the year
                List<BookingEntity> allBookings = bookingRepository.findAll();

                for (int month = 1; month <= 12; month++) {
                        final int currentMonth = month;

                        // Filter bookings for this month and year
                        List<BookingEntity> monthlyBookings = allBookings.stream()
                                        .filter(b -> b.getStartDate().getYear() == year)
                                        .filter(b -> b.getStartDate().getMonthValue() == currentMonth)
                                        .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
                                        .collect(Collectors.toList());

                        BigDecimal monthlyRevenue = monthlyBookings.stream()
                                        .map(BookingEntity::getTotalAmount)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                        result.add(MonthlyRevenueDTO.builder()
                                        .year(year)
                                        .month(month)
                                        .monthName(Month.of(month).name())
                                        .revenue(monthlyRevenue)
                                        .bookingCount((long) monthlyBookings.size())
                                        .build());
                }

                return result;
        }
}
