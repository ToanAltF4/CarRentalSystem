package com.carrentalsystem.service.impl;

import com.carrentalsystem.dto.dashboard.DashboardOverviewDTO;
import com.carrentalsystem.dto.dashboard.DashboardStatsDTO;
import com.carrentalsystem.dto.dashboard.MonthlyRevenueDTO;
import com.carrentalsystem.entity.BookingEntity;
import com.carrentalsystem.entity.BookingStatus;
import com.carrentalsystem.repository.BookingRepository;
import com.carrentalsystem.repository.DashboardRepository;
import com.carrentalsystem.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.DateTimeParseException;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Implementation of Dashboard Service.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

        private static final long DASHBOARD_CACHE_TTL_MS = 30_000L;
        private final BookingRepository bookingRepository;
        private final DashboardRepository dashboardRepository;
        private final Map<Integer, TimedValue<List<MonthlyRevenueDTO>>> monthlyRevenueCache = new ConcurrentHashMap<>();
        private volatile DashboardStatsDTO cachedStats;
        private volatile long cachedStatsAtMs;

        private record TimedValue<T>(T value, long cachedAtMs) {
        }

        /** Get value from map by camelCase or lowercase key; null-safe for Number/BigDecimal. */
        private static BigDecimal getBigDecimal(Map<String, Object> map, String key) {
                Object v = map.get(key);
                if (v == null) v = map.get(key.toLowerCase());
                if (v == null) return BigDecimal.ZERO;
                if (v instanceof BigDecimal) return (BigDecimal) v;
                if (v instanceof Number) return BigDecimal.valueOf(((Number) v).doubleValue());
                return BigDecimal.ZERO;
        }

        private static long getLong(Map<String, Object> map, String key) {
                Object v = map.get(key);
                if (v == null) v = map.get(key.toLowerCase());
                if (v == null) return 0L;
                if (v instanceof Number) return ((Number) v).longValue();
                return 0L;
        }

        @Override
        public DashboardStatsDTO getDashboardStats() {
                long now = System.currentTimeMillis();
                DashboardStatsDTO snapshot = cachedStats;
                if (snapshot != null && isFresh(cachedStatsAtMs, now)) {
                        return snapshot;
                }

                synchronized (this) {
                        now = System.currentTimeMillis();
                        snapshot = cachedStats;
                        if (snapshot != null && isFresh(cachedStatsAtMs, now)) {
                                return snapshot;
                        }

                        DashboardStatsDTO freshValue = loadDashboardStatsFromDb();
                        cachedStats = freshValue;
                        cachedStatsAtMs = now;
                        return freshValue;
                }
        }

        private DashboardStatsDTO.RecentBookingDTO toRecentBookingDTO(Object[] row) {
                String name = row[5] != null ? row[5].toString().trim() : "";
                String model = row[6] != null ? row[6].toString().trim() : "";
                String vehicleName = (name + " " + model).trim();
                if (vehicleName.isEmpty()) {
                        vehicleName = "Unknown Vehicle";
                }

                return DashboardStatsDTO.RecentBookingDTO.builder()
                                .id(row[0] instanceof Number ? ((Number) row[0]).longValue() : null)
                                .bookingCode(row[1] != null ? row[1].toString() : null)
                                .customerName(row[2] != null ? row[2].toString() : null)
                                .vehicleName(vehicleName)
                                .status(row[4] != null ? row[4].toString() : "UNKNOWN")
                                .createdAt(formatDate(row[3]))
                                .build();
        }

        private String formatDate(Object dateValue) {
                if (dateValue == null) {
                        return "N/A";
                }

                LocalDate date;
                if (dateValue instanceof LocalDate localDate) {
                        date = localDate;
                } else if (dateValue instanceof LocalDateTime localDateTime) {
                        date = localDateTime.toLocalDate();
                } else if (dateValue instanceof java.sql.Date sqlDate) {
                        date = sqlDate.toLocalDate();
                } else if (dateValue instanceof java.sql.Timestamp timestamp) {
                        date = timestamp.toLocalDateTime().toLocalDate();
                } else {
                        return dateValue.toString();
                }

                return date.atStartOfDay().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        }

        @Override
        public List<MonthlyRevenueDTO> getMonthlyRevenue(Integer year) {
                int targetYear = year != null ? year : LocalDate.now().getYear();
                long now = System.currentTimeMillis();

                TimedValue<List<MonthlyRevenueDTO>> cachedValue = monthlyRevenueCache.get(targetYear);
                if (cachedValue != null && isFresh(cachedValue.cachedAtMs(), now)) {
                        return copyMonthlyRevenueList(cachedValue.value());
                }

                List<MonthlyRevenueDTO> freshValue = loadMonthlyRevenueFromDb(targetYear);
                monthlyRevenueCache.put(targetYear, new TimedValue<>(freshValue, now));
                return copyMonthlyRevenueList(freshValue);
        }

        @Override
        public DashboardOverviewDTO getDashboardOverview(Integer year) {
                return DashboardOverviewDTO.builder()
                                .stats(getDashboardStats())
                                .monthlyRevenue(getMonthlyRevenue(year))
                                .build();
        }

        private DashboardStatsDTO loadDashboardStatsFromDb() {
                Map<String, Object> stats = dashboardRepository.getDashboardStats();
                if (stats == null) {
                        return DashboardStatsDTO.builder()
                                        .totalRevenue(BigDecimal.ZERO)
                                        .totalBookings(0L)
                                        .activeRentals(0L)
                                        .pendingBookings(0L)
                                        .availableVehicles(0L)
                                        .totalVehicles(0L)
                                        .recentBookings(List.of())
                                        .build();
                }

                BigDecimal totalRevenue = getBigDecimal(stats, "totalRevenue");
                long totalBookings = getLong(stats, "totalBookings");
                long activeRentals = getLong(stats, "activeRentals");
                long pendingBookings = getLong(stats, "pendingBookings");
                long availableVehicles = getLong(stats, "availableVehicles");
                long totalVehicles = getLong(stats, "totalVehicles");

                List<Object[]> recentRows = bookingRepository.findRecentBookingSummaries();
                List<DashboardStatsDTO.RecentBookingDTO> recentBookings = recentRows.stream()
                                .map(this::toRecentBookingDTO)
                                .toList();

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

        private List<MonthlyRevenueDTO> loadMonthlyRevenueFromDb(int year) {
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

                bookingRepository.findAll().stream()
                                .filter(booking -> booking.getStatus() != BookingStatus.CANCELLED)
                                .forEach(booking -> accumulateMonthlyRevenue(result, booking, year));

                return result;
        }

        private void accumulateMonthlyRevenue(List<MonthlyRevenueDTO> result, BookingEntity booking, int year) {
                LocalDate monthDate = resolveMonthDate(booking);
                if (monthDate == null || monthDate.getYear() != year) {
                        return;
                }

                int monthIndex = monthDate.getMonthValue() - 1;
                MonthlyRevenueDTO dto = result.get(monthIndex);
                dto.setRevenue(dto.getRevenue().add(booking.getTotalAmount() != null ? booking.getTotalAmount() : BigDecimal.ZERO));
                dto.setBookingCount(dto.getBookingCount() + 1);
        }

        private LocalDate resolveMonthDate(BookingEntity booking) {
                List<LocalDate> selectedDates = parseSelectedDates(booking.getSelectedDates());
                if (!selectedDates.isEmpty()) {
                        return selectedDates.get(0);
                }
                return booking.getStartDate();
        }

        private List<LocalDate> parseSelectedDates(String rawDates) {
                if (rawDates == null || rawDates.isBlank()) {
                        return List.of();
                }
                return java.util.Arrays.stream(rawDates.split(","))
                                .map(String::trim)
                                .filter(value -> !value.isBlank())
                                .map(value -> {
                                        try {
                                                return LocalDate.parse(value);
                                        } catch (DateTimeParseException ex) {
                                                return null;
                                        }
                                })
                                .filter(java.util.Objects::nonNull)
                                .distinct()
                                .sorted()
                                .toList();
        }

        private List<MonthlyRevenueDTO> copyMonthlyRevenueList(List<MonthlyRevenueDTO> source) {
                return source.stream()
                                .map(item -> MonthlyRevenueDTO.builder()
                                                .year(item.getYear())
                                                .month(item.getMonth())
                                                .monthName(item.getMonthName())
                                                .revenue(item.getRevenue())
                                                .bookingCount(item.getBookingCount())
                                                .build())
                                .toList();
        }

        private boolean isFresh(long cachedAtMs, long nowMs) {
                return nowMs - cachedAtMs < DASHBOARD_CACHE_TTL_MS;
        }
}
