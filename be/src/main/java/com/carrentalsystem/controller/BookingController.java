package com.carrentalsystem.controller;

import com.carrentalsystem.dto.booking.BookingRequestDTO;
import com.carrentalsystem.dto.booking.BookingResponseDTO;
import com.carrentalsystem.entity.BookingStatus;
import com.carrentalsystem.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Booking management operations.
 */
@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Vehicle Booking Management API")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @Operation(summary = "Create a new booking", description = "Create a new vehicle booking with validation and pricing calculation")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Booking created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data or date range"),
            @ApiResponse(responseCode = "404", description = "Vehicle not found"),
            @ApiResponse(responseCode = "409", description = "Vehicle not available or booking conflict")
    })
    public ResponseEntity<BookingResponseDTO> createBooking(
            @Valid @RequestBody BookingRequestDTO request) {
        BookingResponseDTO response = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Booking found"),
            @ApiResponse(responseCode = "404", description = "Booking not found")
    })
    public ResponseEntity<BookingResponseDTO> getBookingById(
            @Parameter(description = "Booking ID") @PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/code/{bookingCode}")
    @Operation(summary = "Get booking by code", description = "Retrieve booking using the booking code")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Booking found"),
            @ApiResponse(responseCode = "404", description = "Booking not found")
    })
    public ResponseEntity<BookingResponseDTO> getBookingByCode(
            @Parameter(description = "Booking code (e.g., BK-20240115-A1B2)") @PathVariable String bookingCode) {
        return ResponseEntity.ok(bookingService.getBookingByCode(bookingCode));
    }

    @GetMapping
    @Operation(summary = "Get all bookings")
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get bookings by status")
    public ResponseEntity<List<BookingResponseDTO>> getBookingsByStatus(
            @Parameter(description = "Booking status") @PathVariable BookingStatus status) {
        return ResponseEntity.ok(bookingService.getBookingsByStatus(status));
    }

    @GetMapping("/customer")
    @Operation(summary = "Get bookings by customer email")
    public ResponseEntity<List<BookingResponseDTO>> getBookingsByCustomerEmail(
            @Parameter(description = "Customer email") @RequestParam String email) {
        return ResponseEntity.ok(bookingService.getBookingsByCustomerEmail(email));
    }

    @GetMapping("/vehicle/{vehicleId}")
    @Operation(summary = "Get bookings by vehicle")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Bookings retrieved"),
            @ApiResponse(responseCode = "404", description = "Vehicle not found")
    })
    public ResponseEntity<List<BookingResponseDTO>> getBookingsByVehicle(
            @Parameter(description = "Vehicle ID") @PathVariable Long vehicleId) {
        return ResponseEntity.ok(bookingService.getBookingsByVehicle(vehicleId));
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Get upcoming bookings", description = "Get all bookings starting today or later")
    public ResponseEntity<List<BookingResponseDTO>> getUpcomingBookings() {
        return ResponseEntity.ok(bookingService.getUpcomingBookings());
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update booking status", description = "Update booking status following the flow: PENDING → CONFIRMED → IN_PROGRESS → COMPLETED")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Status updated"),
            @ApiResponse(responseCode = "400", description = "Invalid status transition"),
            @ApiResponse(responseCode = "404", description = "Booking not found")
    })
    public ResponseEntity<BookingResponseDTO> updateBookingStatus(
            @Parameter(description = "Booking ID") @PathVariable Long id,
            @Parameter(description = "New status") @RequestParam BookingStatus status) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel booking")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Booking cancelled"),
            @ApiResponse(responseCode = "400", description = "Cannot cancel booking"),
            @ApiResponse(responseCode = "404", description = "Booking not found")
    })
    public ResponseEntity<BookingResponseDTO> cancelBooking(
            @Parameter(description = "Booking ID") @PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }
}
