package com.carrentalsystem.service.impl;

import com.carrentalsystem.dto.report.*;
import com.carrentalsystem.repository.BookingRepository;
import com.carrentalsystem.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final BookingRepository bookingRepository;

    @Override
    public ReportOverviewDTO getReportOverview(LocalDate from, LocalDate to) {
        // Default: last 30 days
        if (from == null) {
            from = LocalDate.now().minusDays(30);
        }
        if (to == null) {
            to = LocalDate.now();
        }

        LocalDateTime fromDt = from.atStartOfDay();
        LocalDateTime toDt = to.atTime(LocalTime.MAX);

        // 1. Status breakdown
        List<BookingRepository.StatusCountProjection> statusRows =
                bookingRepository.countBookingsByStatusInRange(fromDt, toDt);

        long totalBookings = statusRows.stream()
                .mapToLong(r -> r.getCount() != null ? r.getCount() : 0)
                .sum();

        List<BookingStatusBreakdownDTO> statusBreakdown = statusRows.stream()
                .map(r -> {
                    long count = r.getCount() != null ? r.getCount() : 0;
                    double pct = totalBookings > 0
                            ? BigDecimal.valueOf(count * 100.0 / totalBookings)
                                .setScale(1, RoundingMode.HALF_UP).doubleValue()
                            : 0.0;
                    return BookingStatusBreakdownDTO.builder()
                            .status(r.getStatus())
                            .count(count)
                            .percentage(pct)
                            .build();
                })
                .toList();

        long completedBookings = statusBreakdown.stream()
                .filter(s -> "COMPLETED".equals(s.getStatus()))
                .mapToLong(BookingStatusBreakdownDTO::getCount)
                .sum();

        long cancelledBookings = statusBreakdown.stream()
                .filter(s -> "CANCELLED".equals(s.getStatus()))
                .mapToLong(BookingStatusBreakdownDTO::getCount)
                .sum();

        // 2. Revenue by category
        List<BookingRepository.RevenueByCategoryProjection> catRows =
                bookingRepository.revenueByCategory(fromDt, toDt);

        List<RevenueByCategoryDTO> revenueByCategory = catRows.stream()
                .map(r -> RevenueByCategoryDTO.builder()
                        .categoryName(r.getCategoryName())
                        .brand(r.getBrand())
                        .revenue(r.getRevenue() != null ? r.getRevenue() : BigDecimal.ZERO)
                        .bookingCount(r.getBookingCount() != null ? r.getBookingCount() : 0L)
                        .build())
                .toList();

        BigDecimal totalRevenue = revenueByCategory.stream()
                .map(RevenueByCategoryDTO::getRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. Top vehicles
        List<BookingRepository.TopVehicleProjection> topRows =
                bookingRepository.topVehicles(fromDt, toDt, 10);

        List<TopVehicleDTO> topVehicles = topRows.stream()
                .map(r -> TopVehicleDTO.builder()
                        .vehicleId(r.getVehicleId())
                        .categoryName(r.getCategoryName())
                        .brand(r.getBrand())
                        .licensePlate(r.getLicensePlate())
                        .bookingCount(r.getBookingCount() != null ? r.getBookingCount() : 0L)
                        .totalRevenue(r.getTotalRevenue() != null ? r.getTotalRevenue() : BigDecimal.ZERO)
                        .build())
                .toList();

        // 4. Daily trend
        List<BookingRepository.DailyTrendProjection> dailyRows =
                bookingRepository.dailyBookingTrend(fromDt, toDt);

        List<DailyBookingTrendDTO> dailyTrend = dailyRows.stream()
                .map(r -> DailyBookingTrendDTO.builder()
                        .date(r.getDate())
                        .bookingCount(r.getBookingCount() != null ? r.getBookingCount() : 0L)
                        .revenue(r.getRevenue() != null ? r.getRevenue() : BigDecimal.ZERO)
                        .build())
                .toList();

        return ReportOverviewDTO.builder()
                .totalRevenue(totalRevenue)
                .totalBookings(totalBookings)
                .completedBookings(completedBookings)
                .cancelledBookings(cancelledBookings)
                .statusBreakdown(statusBreakdown)
                .revenueByCategory(revenueByCategory)
                .topVehicles(topVehicles)
                .dailyTrend(dailyTrend)
                .build();
    }
}
