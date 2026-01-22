package com.carrentalsystem.service;

import com.carrentalsystem.dto.booking.BookingRequestDTO;
import com.carrentalsystem.dto.booking.BookingResponseDTO;
import com.carrentalsystem.entity.BookingStatus;

import java.util.List;

/**
 * Service interface for Booking operations.
 */
public interface BookingService {

    /**
     * Create a new booking with validation and pricing calculation.
     */
    BookingResponseDTO createBooking(BookingRequestDTO request);

    /**
     * Get booking by ID.
     */
    BookingResponseDTO getBookingById(Long id);

    /**
     * Get booking by booking code.
     */
    BookingResponseDTO getBookingByCode(String bookingCode);

    /**
     * Get all bookings.
     */
    List<BookingResponseDTO> getAllBookings();

    /**
     * Get bookings by status.
     */
    List<BookingResponseDTO> getBookingsByStatus(BookingStatus status);

    /**
     * Get bookings by customer email.
     */
    List<BookingResponseDTO> getBookingsByCustomerEmail(String email);

    /**
     * Get bookings by vehicle ID.
     */
    List<BookingResponseDTO> getBookingsByVehicle(Long vehicleId);

    /**
     * Update booking status.
     */
    BookingResponseDTO updateBookingStatus(Long id, BookingStatus status);

    /**
     * Cancel booking.
     */
    BookingResponseDTO cancelBooking(Long id);

    /**
     * Get upcoming bookings (starting today or later).
     */
    List<BookingResponseDTO> getUpcomingBookings();
}
