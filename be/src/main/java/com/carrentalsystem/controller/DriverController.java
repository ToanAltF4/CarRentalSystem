package com.carrentalsystem.controller;

import com.carrentalsystem.entity.BookingEntity;
import com.carrentalsystem.entity.BookingStatus;
import com.carrentalsystem.entity.UserEntity;
import com.carrentalsystem.repository.BookingRepository;
import com.carrentalsystem.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/v1/driver")
@RequiredArgsConstructor
@Tag(name = "Driver Dashboard", description = "Driver trip management endpoints")
public class DriverController {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Operation(summary = "Get driver dashboard stats")
    @GetMapping("/stats")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Map<String, Object>> getDriverStats() {
        UserEntity driver = getCurrentDriver();
        List<BookingEntity> myTrips = bookingRepository.findByDriverIdWithDetails(driver.getId());

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTrips", myTrips.size());
        stats.put("completedTrips", myTrips.stream().filter(b -> b.getStatus() == BookingStatus.COMPLETED).count());
        stats.put("activeTrips", myTrips.stream()
                .filter(b -> b.getStatus() == BookingStatus.IN_PROGRESS || b.getStatus() == BookingStatus.ONGOING)
                .count());
        stats.put("pendingTrips", myTrips.stream().filter(b -> b.getStatus() == BookingStatus.ASSIGNED).count());

        BigDecimal totalEarnings = myTrips.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .map(b -> b.getDriverFee() != null ? b.getDriverFee() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalEarnings", totalEarnings);

        LocalDate today = LocalDate.now();
        long todayTrips = myTrips.stream().filter(b -> isBookedOnDate(b, today)).count();
        stats.put("todayTrips", todayTrips);
        return ResponseEntity.ok(stats);
    }

    @Operation(summary = "Get all trips assigned to driver")
    @GetMapping("/trips")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<List<Map<String, Object>>> getMyTrips() {
        UserEntity driver = getCurrentDriver();
        List<BookingEntity> trips = bookingRepository.findByDriverIdWithDetails(driver.getId());
        List<Map<String, Object>> tripDTOs = trips.stream()
                .sorted(Comparator.comparing(BookingEntity::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toTripDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tripDTOs);
    }

    @Operation(summary = "Get trips by status")
    @GetMapping("/trips/status/{status}")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<List<Map<String, Object>>> getTripsByStatus(@PathVariable String status) {
        UserEntity driver = getCurrentDriver();
        BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
        List<BookingEntity> trips = bookingRepository.findByDriverIdAndStatusWithDetails(driver.getId(), bookingStatus);
        List<Map<String, Object>> tripDTOs = trips.stream()
                .sorted(Comparator.comparing(BookingEntity::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toTripDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tripDTOs);
    }

    @Operation(summary = "Get trip details")
    @GetMapping("/trips/{tripId}")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Map<String, Object>> getTripDetail(@PathVariable Long tripId) {
        UserEntity driver = getCurrentDriver();
        BookingEntity trip = findDriverTripOrThrow(driver.getId(), tripId);
        return ResponseEntity.ok(toTripDTO(trip));
    }

    @Operation(summary = "Accept assigned trip")
    @PutMapping("/trips/{tripId}/accept")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Map<String, Object>> acceptTrip(@PathVariable Long tripId) {
        UserEntity driver = getCurrentDriver();
        BookingEntity trip = findDriverTripOrThrow(driver.getId(), tripId);
        validateWithDriverTrip(trip);

        if (trip.getStatus() != BookingStatus.ASSIGNED) {
            throw new IllegalArgumentException("Trip cannot be accepted in current status: " + trip.getStatus());
        }

        trip.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(trip);
        log.info("Trip {} accepted by driver {}", tripId, driver.getId());
        return ResponseEntity.ok(toTripDTO(trip));
    }

    @Operation(summary = "Start trip")
    @PutMapping("/trips/{tripId}/start")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Map<String, Object>> startTrip(@PathVariable Long tripId) {
        UserEntity driver = getCurrentDriver();
        BookingEntity trip = findDriverTripOrThrow(driver.getId(), tripId);
        validateWithDriverTrip(trip);

        // Driver can start only after staff has completed handover inspection.
        if (trip.getStatus() != BookingStatus.IN_PROGRESS) {
            throw new IllegalArgumentException("Trip can start only after pickup handover is completed");
        }

        trip.setStatus(BookingStatus.ONGOING);
        bookingRepository.save(trip);
        log.info("Trip {} started by driver {}", tripId, driver.getId());
        return ResponseEntity.ok(toTripDTO(trip));
    }

    @Operation(summary = "Complete trip")
    @PutMapping("/trips/{tripId}/complete")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Map<String, Object>> completeTrip(@PathVariable Long tripId) {
        UserEntity driver = getCurrentDriver();
        BookingEntity trip = findDriverTripOrThrow(driver.getId(), tripId);
        validateWithDriverTrip(trip);

        if (trip.getStatus() != BookingStatus.ONGOING) {
            throw new IllegalArgumentException("Trip must be ONGOING");
        }
        // Driver is not allowed to close booking. Return flow is handled by staff inspection.
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Trip is ongoing. Please coordinate return with staff for final inspection.");
        response.put("trip", toTripDTO(trip));
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Decline assigned trip")
    @PutMapping("/trips/{tripId}/decline")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Map<String, Object>> declineTrip(@PathVariable Long tripId) {
        UserEntity driver = getCurrentDriver();
        BookingEntity trip = findDriverTripOrThrow(driver.getId(), tripId);
        validateWithDriverTrip(trip);

        if (trip.getStatus() != BookingStatus.ASSIGNED) {
            throw new IllegalArgumentException("Can only decline assigned trips");
        }

        trip.setDriverId(null);
        trip.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(trip);
        log.info("Trip {} declined by driver {}", tripId, driver.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Trip declined successfully");
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get driver earnings summary")
    @GetMapping("/earnings")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Map<String, Object>> getEarnings() {
        UserEntity driver = getCurrentDriver();
        List<BookingEntity> completedTrips = bookingRepository.findByDriverIdAndStatusWithDetails(
                driver.getId(),
                BookingStatus.COMPLETED);

        BigDecimal totalEarnings = completedTrips.stream()
                .map(b -> b.getDriverFee() != null ? b.getDriverFee() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDate firstDayOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate firstDayOfNextMonth = firstDayOfMonth.plusMonths(1);
        BigDecimal thisMonthEarnings = completedTrips.stream()
                .filter(b -> hasBookedDayInRange(b, firstDayOfMonth, firstDayOfNextMonth))
                .map(b -> b.getDriverFee() != null ? b.getDriverFee() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> earnings = new HashMap<>();
        earnings.put("totalEarnings", totalEarnings);
        earnings.put("thisMonthEarnings", thisMonthEarnings);
        earnings.put("completedTripsCount", completedTrips.size());
        return ResponseEntity.ok(earnings);
    }

    private UserEntity getCurrentDriver() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalArgumentException("Unauthorized");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));
    }

    private BookingEntity findDriverTripOrThrow(Long driverId, Long tripId) {
        BookingEntity trip = bookingRepository.findByIdWithDetails(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));
        if (!driverId.equals(trip.getDriverId())) {
            throw new IllegalArgumentException("Access denied: This trip is not assigned to you");
        }
        return trip;
    }

    private Map<String, Object> toTripDTO(BookingEntity booking) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", booking.getId());
        dto.put("bookingCode", booking.getBookingCode());
        dto.put("customerName", booking.getCustomerName());
        dto.put("customerPhone", booking.getCustomerPhone());
        dto.put("customerEmail", booking.getCustomerEmail());
        dto.put("vehicleName",
                booking.getVehicle() != null && booking.getVehicle().getVehicleCategory() != null
                        ? booking.getVehicle().getVehicleCategory().getName()
                        : null);
        dto.put("vehicleImage",
                booking.getVehicle() != null
                        && booking.getVehicle().getVehicleCategory() != null
                        && booking.getVehicle().getVehicleCategory().getImages() != null
                        && !booking.getVehicle().getVehicleCategory().getImages().isEmpty()
                                ? booking.getVehicle().getVehicleCategory().getImages().get(0).getImageUrl()
                                : null);
        dto.put("vehiclePlate", booking.getVehicle() != null ? booking.getVehicle().getLicensePlate() : null);
        List<LocalDate> selectedDates = resolveSelectedDatesFromBooking(booking);
        dto.put("startDate", selectedDates.isEmpty() ? booking.getStartDate() : selectedDates.get(0));
        dto.put("endDate",
                selectedDates.isEmpty() ? booking.getEndDate() : selectedDates.get(selectedDates.size() - 1));
        dto.put("selectedDates", selectedDates);
        dto.put("status", booking.getStatus() != null ? booking.getStatus().name() : null);
        dto.put("rentalTypeName", booking.getRentalType() != null ? booking.getRentalType().getName() : null);
        dto.put("deliveryAddress", booking.getDeliveryAddress());
        dto.put("driverFee", booking.getDriverFee());
        dto.put("totalAmount", booking.getTotalAmount());
        dto.put("notes", booking.getNotes());
        return dto;
    }

    private void validateWithDriverTrip(BookingEntity trip) {
        String rentalTypeName = trip.getRentalType() != null ? trip.getRentalType().getName() : null;
        if (rentalTypeName == null) {
            throw new IllegalStateException("Trip rental type is not configured");
        }
        String normalized = rentalTypeName.trim().toUpperCase();
        boolean withDriver = normalized.contains("DRIVER") && !normalized.contains("SELF");
        if (!withDriver) {
            throw new IllegalStateException("Driver workflow is only available for WITH_DRIVER trips");
        }
    }

    private boolean isBookedOnDate(BookingEntity booking, LocalDate date) {
        return resolveSelectedDatesFromBooking(booking).contains(date);
    }

    private boolean hasBookedDayInRange(BookingEntity booking, LocalDate startInclusive, LocalDate endExclusive) {
        return resolveSelectedDatesFromBooking(booking).stream()
                .anyMatch(day -> !day.isBefore(startInclusive) && day.isBefore(endExclusive));
    }

    private List<LocalDate> resolveSelectedDatesFromBooking(BookingEntity booking) {
        List<LocalDate> parsed = parseSelectedDates(booking.getSelectedDates());
        if (!parsed.isEmpty()) {
            return parsed;
        }

        if (booking.getStartDate() == null || booking.getEndDate() == null) {
            return List.of();
        }

        List<LocalDate> expanded = new ArrayList<>();
        LocalDate cursor = booking.getStartDate();
        while (!cursor.isAfter(booking.getEndDate())) {
            expanded.add(cursor);
            cursor = cursor.plusDays(1);
        }
        if (expanded.isEmpty()) {
            expanded.add(booking.getStartDate());
        }
        return expanded;
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
}
