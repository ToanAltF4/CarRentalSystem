package com.carrentalsystem.service.impl;

import com.carrentalsystem.dto.booking.BookingRequestDTO;
import com.carrentalsystem.dto.booking.BookingResponseDTO;
import com.carrentalsystem.entity.*;
import com.carrentalsystem.exception.*;
import com.carrentalsystem.mapper.BookingMapper;
import com.carrentalsystem.repository.*;
import com.carrentalsystem.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

/**
 * Implementation of BookingService with full business logic.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final PricingRepository pricingRepository;
    private final BookingMapper bookingMapper;

    @Override
    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO request) {
        log.info("Creating booking for vehicle ID: {} from {} to {}",
                request.getVehicleId(), request.getStartDate(), request.getEndDate());

        // 1. Validate dates
        validateDates(request.getStartDate(), request.getEndDate());

        // 2. Find and validate vehicle
        VehicleEntity vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", request.getVehicleId()));

        // 3. Check vehicle status is AVAILABLE
        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new VehicleNotAvailableException(vehicle.getId(),
                    "Vehicle status is " + vehicle.getStatus());
        }

        // 4. Check for overlapping bookings
        if (bookingRepository.hasOverlappingBookings(
                vehicle.getId(), request.getStartDate(), request.getEndDate())) {
            List<BookingEntity> conflicts = bookingRepository.findOverlappingBookings(
                    vehicle.getId(), request.getStartDate(), request.getEndDate());
            String conflictDates = conflicts.stream()
                    .map(b -> b.getStartDate() + " to " + b.getEndDate())
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("unknown");
            throw new VehicleNotAvailableException(vehicle.getId(),
                    "Booking conflicts with existing reservations: " + conflictDates);
        }

        // 5. Calculate pricing
        BigDecimal dailyRate = calculateDailyRate(vehicle);
        int totalDays = calculateTotalDays(request.getStartDate(), request.getEndDate());
        BigDecimal totalAmount = dailyRate.multiply(BigDecimal.valueOf(totalDays));

        // 6. Create booking entity
        BookingEntity booking = bookingMapper.toEntity(request);
        booking.setBookingCode(generateBookingCode());
        booking.setVehicle(vehicle);
        booking.setTotalDays(totalDays);
        booking.setDailyRate(dailyRate);
        booking.setTotalAmount(totalAmount);
        booking.setStatus(BookingStatus.PENDING);

        // 7. Save booking
        BookingEntity saved = bookingRepository.save(booking);
        log.info("Booking created successfully with code: {}", saved.getBookingCode());

        return bookingMapper.toResponseDTO(saved);
    }

    @Override
    public BookingResponseDTO getBookingById(Long id) {
        BookingEntity booking = findBookingOrThrow(id);
        return bookingMapper.toResponseDTO(booking);
    }

    @Override
    public BookingResponseDTO getBookingByCode(String bookingCode) {
        BookingEntity booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "code", bookingCode));
        return bookingMapper.toResponseDTO(booking);
    }

    @Override
    public List<BookingResponseDTO> getAllBookings() {
        List<BookingEntity> bookings = bookingRepository.findAll();
        return bookingMapper.toResponseDTOList(bookings);
    }

    @Override
    public List<BookingResponseDTO> getBookingsByStatus(BookingStatus status) {
        List<BookingEntity> bookings = bookingRepository.findByStatusOrderByCreatedAtDesc(status);
        return bookingMapper.toResponseDTOList(bookings);
    }

    @Override
    public List<BookingResponseDTO> getBookingsByCustomerEmail(String email) {
        List<BookingEntity> bookings = bookingRepository.findByCustomerEmailOrderByCreatedAtDesc(email);
        return bookingMapper.toResponseDTOList(bookings);
    }

    @Override
    public List<BookingResponseDTO> getBookingsByVehicle(Long vehicleId) {
        // Verify vehicle exists
        if (!vehicleRepository.existsById(vehicleId)) {
            throw new ResourceNotFoundException("Vehicle", "id", vehicleId);
        }
        List<BookingEntity> bookings = bookingRepository.findByVehicleIdOrderByStartDateDesc(vehicleId);
        return bookingMapper.toResponseDTOList(bookings);
    }

    @Override
    @Transactional
    public BookingResponseDTO updateBookingStatus(Long id, BookingStatus status) {
        log.info("Updating booking ID: {} to status: {}", id, status);

        BookingEntity booking = findBookingOrThrow(id);

        // Validate status transition
        validateStatusTransition(booking.getStatus(), status);

        booking.setStatus(status);

        // If confirmed, optionally update vehicle status
        if (status == BookingStatus.IN_PROGRESS) {
            booking.getVehicle().setStatus(VehicleStatus.RENTED);
            vehicleRepository.save(booking.getVehicle());
        } else if (status == BookingStatus.COMPLETED || status == BookingStatus.CANCELLED) {
            booking.getVehicle().setStatus(VehicleStatus.AVAILABLE);
            vehicleRepository.save(booking.getVehicle());
        }

        BookingEntity updated = bookingRepository.save(booking);
        return bookingMapper.toResponseDTO(updated);
    }

    @Override
    @Transactional
    public BookingResponseDTO cancelBooking(Long id) {
        log.info("Cancelling booking ID: {}", id);

        BookingEntity booking = findBookingOrThrow(id);

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new IllegalArgumentException("Cannot cancel a completed booking");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Booking is already cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);

        // Release vehicle if it was in progress
        if (booking.getVehicle().getStatus() == VehicleStatus.RENTED) {
            booking.getVehicle().setStatus(VehicleStatus.AVAILABLE);
            vehicleRepository.save(booking.getVehicle());
        }

        BookingEntity cancelled = bookingRepository.save(booking);
        return bookingMapper.toResponseDTO(cancelled);
    }

    @Override
    public List<BookingResponseDTO> getUpcomingBookings() {
        List<BookingEntity> bookings = bookingRepository.findUpcomingBookings(LocalDate.now());
        return bookingMapper.toResponseDTOList(bookings);
    }

    // ============== Private Helper Methods ==============

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Start date and end date are required");
        }
        if (startDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Start date cannot be in the past");
        }
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date must be after start date");
        }
        if (startDate.equals(endDate)) {
            throw new IllegalArgumentException("Rental must be at least 1 day (end date must be after start date)");
        }
    }

    private BigDecimal calculateDailyRate(VehicleEntity vehicle) {
        // Try to get pricing from vehicle category
        if (vehicle.getCategory() != null) {
            return pricingRepository.findCurrentPricingByCategory(vehicle.getCategory().getId())
                    .map(PricingEntity::getDailyPrice)
                    .orElseGet(() -> {
                        log.warn("No active pricing found for category ID: {}, using vehicle daily rate",
                                vehicle.getCategory().getId());
                        return vehicle.getDailyRate();
                    });
        }

        // Fallback to vehicle's own daily rate
        if (vehicle.getDailyRate() == null) {
            throw new PricingNotFoundException("No pricing available for vehicle ID: " + vehicle.getId());
        }
        return vehicle.getDailyRate();
    }

    private int calculateTotalDays(LocalDate startDate, LocalDate endDate) {
        return (int) ChronoUnit.DAYS.between(startDate, endDate);
    }

    private String generateBookingCode() {
        // Format: BK-YYYYMMDD-XXXX (e.g., BK-20240115-A1B2)
        String datePart = LocalDate.now().toString().replace("-", "");
        String randomPart = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return "BK-" + datePart + "-" + randomPart;
    }

    private BookingEntity findBookingOrThrow(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
    }

    private void validateStatusTransition(BookingStatus current, BookingStatus next) {
        // Define valid transitions
        boolean valid = switch (current) {
            case PENDING -> next == BookingStatus.CONFIRMED || next == BookingStatus.CANCELLED;
            case CONFIRMED -> next == BookingStatus.IN_PROGRESS || next == BookingStatus.CANCELLED;
            case IN_PROGRESS -> next == BookingStatus.COMPLETED || next == BookingStatus.CANCELLED;
            case COMPLETED, CANCELLED -> false; // Terminal states
        };

        if (!valid) {
            throw new IllegalArgumentException(
                    String.format("Invalid status transition from %s to %s", current, next));
        }
    }
}
