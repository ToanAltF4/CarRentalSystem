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
    private final UserRepository userRepository;
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
        // 2. Find and validate vehicle
        VehicleEntity vehicle;

        if (request.getVehicleId() != null) {
            // Case 1: Booking specific vehicle ID
            vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", request.getVehicleId()));
        } else if (request.getBrand() != null && request.getModel() != null) {
            // Case 2: Booking by Model (Auto-assign available vehicle)
            List<VehicleEntity> candidates = vehicleRepository.findByBrandAndModelAndStatus(
                    request.getBrand(), request.getModel(), VehicleStatus.AVAILABLE);

            // Filter for one that has no conflicting bookings
            vehicle = candidates.stream()
                    .filter(v -> !bookingRepository.hasOverlappingBookings(
                            v.getId(),
                            request.getStartDate(),
                            request.getEndDate(),
                            BookingStatus.CANCELLED,
                            BookingStatus.COMPLETED))
                    .findFirst()
                    .orElseThrow(() -> new com.carrentalsystem.exception.VehicleNotAvailableException(0L,
                            "No " + request.getBrand() + " " + request.getModel() + " available for selected dates"));
        } else {
            throw new IllegalArgumentException("Either vehicleId or brand/model must be provided");
        }

        // 3. Check vehicle status is AVAILABLE
        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new VehicleNotAvailableException(vehicle.getId(),
                    "Vehicle status is " + vehicle.getStatus());
        }

        // 4. Check for overlapping bookings
        if (bookingRepository.hasOverlappingBookings(
                vehicle.getId(),
                request.getStartDate(),
                request.getEndDate(),
                BookingStatus.CANCELLED,
                BookingStatus.COMPLETED)) {
            List<BookingEntity> conflicts = bookingRepository.findOverlappingBookings(
                    vehicle.getId(),
                    request.getStartDate(),
                    request.getEndDate(),
                    BookingStatus.CANCELLED,
                    BookingStatus.COMPLETED);
            String conflictDates = conflicts.stream()
                    .map(b -> b.getStartDate() + " to " + b.getEndDate())
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("unknown");
            throw new VehicleNotAvailableException(vehicle.getId(),
                    "Booking conflicts with existing reservations: " + conflictDates);
        }

        // 5. Check user's driver license status
        UserEntity user = userRepository.findByEmail(request.getCustomerEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getCustomerEmail()));

        boolean hasApprovedLicense = user.getLicenseStatus() == LicenseStatus.APPROVED;
        if (!hasApprovedLicense) {
            throw new IllegalArgumentException(
                    "Driver's license not verified. Please upload and verify your driver's license before booking.");
        }

        // 6. Calculate pricing
        BigDecimal dailyRate = calculateDailyRate(vehicle);
        int totalDays = calculateTotalDays(request.getStartDate(), request.getEndDate());
        BigDecimal totalAmount = dailyRate.multiply(BigDecimal.valueOf(totalDays));

        // 7. Create booking entity - Auto CONFIRMED since license is verified
        BookingEntity booking = bookingMapper.toEntity(request);
        booking.setBookingCode(generateBookingCode());
        booking.setVehicle(vehicle);
        booking.setTotalDays(totalDays);
        booking.setDailyRate(dailyRate);
        booking.setRentalFee(totalAmount);
        booking.setTotalAmount(totalAmount);
        booking.setStatus(BookingStatus.CONFIRMED); // Auto confirm since license is verified

        // 8. Save booking
        BookingEntity saved = bookingRepository.save(booking);
        log.info("Booking created and auto-confirmed with code: {}", saved.getBookingCode());

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
        List<BookingEntity> bookings = bookingRepository.findAllWithVehicle();
        return toEnrichedDTOList(bookings);
    }

    @Override
    public List<BookingResponseDTO> getBookingsByStatus(BookingStatus status) {
        List<BookingEntity> bookings = bookingRepository.findByStatusOrderByStartDateDesc(status);
        return toEnrichedDTOList(bookings);
    }

    @Override
    public List<BookingResponseDTO> getBookingsByCustomerEmail(String email) {
        List<BookingEntity> bookings = bookingRepository.findByCustomerEmailOrderByStartDateDesc(email);
        return toEnrichedDTOList(bookings);
    }

    @Override
    public List<BookingResponseDTO> getBookingsByVehicle(Long vehicleId) {
        // Verify vehicle exists
        if (!vehicleRepository.existsById(vehicleId)) {
            throw new ResourceNotFoundException("Vehicle", "id", vehicleId);
        }
        List<BookingEntity> bookings = bookingRepository.findByVehicleIdOrderByStartDateDesc(vehicleId);
        return toEnrichedDTOList(bookings);
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
        return toEnrichedDTO(updated);
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
        return toEnrichedDTO(cancelled);
    }

    @Override
    public List<BookingResponseDTO> getUpcomingBookings() {
        List<BookingEntity> bookings = bookingRepository.findUpcomingBookings(LocalDate.now(), BookingStatus.CANCELLED);
        return toEnrichedDTOList(bookings);
    }

    // ============== Private Helper Methods ==============

    private BookingResponseDTO toEnrichedDTO(BookingEntity entity) {
        BookingResponseDTO dto = bookingMapper.toResponseDTO(entity);

        // Enrich Staff Name
        if (entity.getAssignedStaffId() != null) {
            userRepository.findById(entity.getAssignedStaffId())
                    .ifPresent(staff -> dto.setAssignedStaffName(staff.getFullName()));
        }

        // Enrich Driver Name
        if (entity.getDriverId() != null) {
            userRepository.findById(entity.getDriverId())
                    .ifPresent(driver -> dto.setDriverName(driver.getFullName()));
        }

        // Enrich Assigned By
        if (entity.getAssignedBy() != null) {
            userRepository.findById(entity.getAssignedBy())
                    .ifPresent(op -> dto.setAssignedByName(op.getFullName()));
        }

        // Rental Type Name (Fallback if Mapper missed it or null)
        if (dto.getRentalTypeName() == null && entity.getRentalType() != null) {
            dto.setRentalTypeName(entity.getRentalType().getName());
            dto.setRentalTypeId(entity.getRentalType().getId());
        } else if (dto.getRentalTypeName() == null) {
            dto.setRentalTypeName("Self Drive");
        }

        return dto;
    }

    private List<BookingResponseDTO> toEnrichedDTOList(List<BookingEntity> entities) {
        return entities.stream().map(this::toEnrichedDTO).toList();
    }

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
            case CONFIRMED ->
                next == BookingStatus.IN_PROGRESS || next == BookingStatus.ASSIGNED || next == BookingStatus.CANCELLED;
            case ASSIGNED ->
                next == BookingStatus.CONFIRMED || next == BookingStatus.IN_PROGRESS || next == BookingStatus.CANCELLED;
            case IN_PROGRESS ->
                next == BookingStatus.ONGOING || next == BookingStatus.COMPLETED || next == BookingStatus.CANCELLED;
            case ONGOING -> next == BookingStatus.COMPLETED || next == BookingStatus.CANCELLED;
            case COMPLETED, CANCELLED -> false; // Terminal states
        };

        if (!valid) {
            throw new IllegalArgumentException(
                    String.format("Invalid status transition from %s to %s", current, next));
        }
    }
}
