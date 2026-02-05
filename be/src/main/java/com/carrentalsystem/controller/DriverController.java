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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Driver Dashboard Controller
 * Endpoints for driver to manage their trips
 */
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
    public ResponseEntity<Map<String, Object>> getDriverStats(@AuthenticationPrincipal UserDetails userDetails) {
        UserEntity driver = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));

        List<BookingEntity> myTrips = bookingRepository.findByDriverId(driver.getId());

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTrips", myTrips.size());
        stats.put("completedTrips", myTrips.stream().filter(b -> b.getStatus() == BookingStatus.COMPLETED).count());
        stats.put("activeTrips",
                myTrips.stream().filter(
                        b -> b.getStatus() == BookingStatus.IN_PROGRESS || b.getStatus() == BookingStatus.ONGOING)
                        .count());
        stats.put("pendingTrips", myTrips.stream().filter(b -> b.getStatus() == BookingStatus.ASSIGNED).count());

        // Calculate total earnings
        BigDecimal totalEarnings = myTrips.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .map(b -> b.getDriverFee() != null ? b.getDriverFee() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalEarnings", totalEarnings);

        // Today's trips
        LocalDate today = LocalDate.now();
        long todayTrips = myTrips.stream()
                .filter(b -> b.getStartDate() != null && b.getStartDate().equals(today))
                .count();
        stats.put("todayTrips", todayTrips);

        return ResponseEntity.ok(stats);
    }

    @Operation(summary = "Get all trips assigned to driver")
    @GetMapping("/trips")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<List<Map<String, Object>>> getMyTrips(@AuthenticationPrincipal UserDetails userDetails) {
        UserEntity driver = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));

        List<BookingEntity> trips = bookingRepository.findByDriverId(driver.getId());

        List<Map<String, Object>> tripDTOs = trips.stream()
                .map(this::toTripDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(tripDTOs);
    }

    @Operation(summary = "Get trips by status")
    @GetMapping("/trips/status/{status}")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<List<Map<String, Object>>> getTripsByStatus(
            @PathVariable String status,
            @AuthenticationPrincipal UserDetails userDetails) {
        UserEntity driver = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));

        BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
        List<BookingEntity> trips = bookingRepository.findByDriverIdAndStatus(driver.getId(), bookingStatus);

        List<Map<String, Object>> tripDTOs = trips.stream()
                .map(this::toTripDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(tripDTOs);
    }

    @Operation(summary = "Get trip details")
    @GetMapping("/trips/{tripId}")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Map<String, Object>> getTripDetail(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UserEntity driver = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));

        BookingEntity trip = bookingRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        // Verify this trip belongs to the driver
        if (!driver.getId().equals(trip.getDriverId())) {
            throw new IllegalArgumentException("Access denied: This trip is not assigned to you");
        }

        return ResponseEntity.ok(toTripDTO(trip));
    }

    @Operation(summary = "Accept assigned trip")
    @PutMapping("/trips/{tripId}/accept")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Map<String, Object>> acceptTrip(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UserEntity driver = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));

        BookingEntity trip = bookingRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        if (!driver.getId().equals(trip.getDriverId())) {
            throw new IllegalArgumentException("Access denied");
        }

        if (trip.getStatus() != BookingStatus.ASSIGNED) {
            throw new IllegalArgumentException("Trip cannot be accepted in current status: " + trip.getStatus());
        }

        trip.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(trip);

        log.info("Trip {} accepted by driver {}", tripId, driver.getId());
        return ResponseEntity.ok(toTripDTO(trip));
    }

    @Operation(summary = "Start trip - picking up customer")
    @PutMapping("/trips/{tripId}/start")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Map<String, Object>> startTrip(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UserEntity driver = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));

        BookingEntity trip = bookingRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        if (!driver.getId().equals(trip.getDriverId())) {
            throw new IllegalArgumentException("Access denied");
        }

        if (trip.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalArgumentException("Trip must be confirmed before starting");
        }

        trip.setStatus(BookingStatus.IN_PROGRESS);
        bookingRepository.save(trip);

        log.info("Trip {} started by driver {}", tripId, driver.getId());
        return ResponseEntity.ok(toTripDTO(trip));
    }

    @Operation(summary = "Complete trip")
    @PutMapping("/trips/{tripId}/complete")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Map<String, Object>> completeTrip(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UserEntity driver = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));

        BookingEntity trip = bookingRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        if (!driver.getId().equals(trip.getDriverId())) {
            throw new IllegalArgumentException("Access denied");
        }

        if (trip.getStatus() != BookingStatus.IN_PROGRESS && trip.getStatus() != BookingStatus.ONGOING) {
            throw new IllegalArgumentException("Trip must be in progress to complete");
        }

        trip.setStatus(BookingStatus.COMPLETED);
        bookingRepository.save(trip);

        log.info("Trip {} completed by driver {}", tripId, driver.getId());
        return ResponseEntity.ok(toTripDTO(trip));
    }

    @Operation(summary = "Decline assigned trip")
    @PutMapping("/trips/{tripId}/decline")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Map<String, Object>> declineTrip(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UserEntity driver = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));

        BookingEntity trip = bookingRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        if (!driver.getId().equals(trip.getDriverId())) {
            throw new IllegalArgumentException("Access denied");
        }

        if (trip.getStatus() != BookingStatus.ASSIGNED) {
            throw new IllegalArgumentException("Can only decline assigned trips");
        }

        // Remove driver assignment
        trip.setDriverId(null);
        trip.setStatus(BookingStatus.CONFIRMED); // Return to confirmed status for reassignment
        bookingRepository.save(trip);

        log.info("Trip {} declined by driver {}", tripId, driver.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Trip declined successfully");
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get driver earnings summary")
    @GetMapping("/earnings")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Map<String, Object>> getEarnings(@AuthenticationPrincipal UserDetails userDetails) {
        UserEntity driver = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));

        List<BookingEntity> completedTrips = bookingRepository.findByDriverIdAndStatus(driver.getId(),
                BookingStatus.COMPLETED);

        BigDecimal totalEarnings = completedTrips.stream()
                .map(b -> b.getDriverFee() != null ? b.getDriverFee() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // This month earnings
        LocalDate firstDayOfMonth = LocalDate.now().withDayOfMonth(1);
        BigDecimal thisMonthEarnings = completedTrips.stream()
                .filter(b -> b.getEndDate() != null && !b.getEndDate().isBefore(firstDayOfMonth))
                .map(b -> b.getDriverFee() != null ? b.getDriverFee() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> earnings = new HashMap<>();
        earnings.put("totalEarnings", totalEarnings);
        earnings.put("thisMonthEarnings", thisMonthEarnings);
        earnings.put("completedTripsCount", completedTrips.size());

        return ResponseEntity.ok(earnings);
    }

    private Map<String, Object> toTripDTO(BookingEntity booking) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", booking.getId());
        dto.put("bookingCode", booking.getBookingCode());
        dto.put("customerName", booking.getCustomerName());
        dto.put("customerPhone", booking.getCustomerPhone());
        dto.put("customerEmail", booking.getCustomerEmail());
        dto.put("vehicleName", booking.getVehicle() != null ? booking.getVehicle().getName() : null);
        dto.put("vehiclePlate", booking.getVehicle() != null ? booking.getVehicle().getLicensePlate() : null);
        dto.put("startDate", booking.getStartDate());
        dto.put("endDate", booking.getEndDate());
        dto.put("status", booking.getStatus() != null ? booking.getStatus().name() : null);
        dto.put("deliveryAddress", booking.getDeliveryAddress());
        dto.put("driverFee", booking.getDriverFee());
        dto.put("totalAmount", booking.getTotalAmount());
        dto.put("notes", booking.getNotes());
        return dto;
    }
}
