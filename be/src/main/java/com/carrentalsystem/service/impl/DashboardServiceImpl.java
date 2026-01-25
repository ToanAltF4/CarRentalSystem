package com.carrentalsystem.service.impl;

import com.carrentalsystem.dto.dashboard.DashboardStatsDTO;
import com.carrentalsystem.dto.dashboard.MonthlyRevenueDTO;
import com.carrentalsystem.entity.*;
import com.carrentalsystem.repository.*;
import com.carrentalsystem.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
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
                // Calculate total revenue from all paid invoices
                List<InvoiceEntity> allInvoices = invoiceRepository.findAll();
                BigDecimal totalRevenue = allInvoices.stream()
                                .filter(inv -> inv.getPaymentStatus() == PaymentStatus.PAID)
                                .map(InvoiceEntity::getTotalAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Count total bookings
                long totalBookings = bookingRepository.count();

                // Count active rentals (IN_PROGRESS status)
                long activeRentals = bookingRepository.findByStatusOrderByStartDateDesc(BookingStatus.IN_PROGRESS)
                                .size();

                // Count pending bookings
                long pendingBookings = bookingRepository.findByStatusOrderByStartDateDesc(BookingStatus.PENDING).size();

                // Count available vehicles
                long availableVehicles = vehicleRepository.findByStatus(VehicleStatus.AVAILABLE).size();

                // Count total vehicles
                long totalVehicles = vehicleRepository.count();

                // Get recent bookings (last 5)
                List<BookingEntity> allBookings = bookingRepository.findAll();
                List<DashboardStatsDTO.RecentBookingDTO> recentBookings = allBookings.stream()
                                .sorted((a, b) -> b.getStartDate().compareTo(a.getStartDate()))
                                .limit(5)
                                .map(b -> DashboardStatsDTO.RecentBookingDTO.builder()
                                                .id(b.getId())
                                                .bookingCode(b.getBookingCode())
                                                .customerName(b.getCustomerName())
                                                .vehicleName(b.getVehicle().getName() + " " + b.getVehicle().getModel())
                                                .status(b.getStatus().name())
                                                .createdAt(b.getStartDate().atStartOfDay().format(
                                                                DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                                                .build())
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
