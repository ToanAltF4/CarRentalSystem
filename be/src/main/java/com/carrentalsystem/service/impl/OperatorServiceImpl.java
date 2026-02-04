package com.carrentalsystem.service.impl;

import com.carrentalsystem.dto.booking.BookingResponseDTO;
import com.carrentalsystem.dto.operator.StaffListDTO;
import com.carrentalsystem.dto.operator.UserLicenseDTO;
import com.carrentalsystem.entity.*;
import com.carrentalsystem.exception.ResourceNotFoundException;
import com.carrentalsystem.mapper.BookingMapper;
import com.carrentalsystem.repository.BookingRepository;
import com.carrentalsystem.repository.RoleRepository;
import com.carrentalsystem.repository.UserRepository;
import com.carrentalsystem.service.OperatorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of OperatorService.
 * Handles booking management, staff assignment, and license verification.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OperatorServiceImpl implements OperatorService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BookingMapper bookingMapper;

    // ==================== Booking Management ====================

    // ==================== Booking Management ====================

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getTodayBookings() {
        log.debug("Fetching today's bookings (active)");
        LocalDate today = LocalDate.now();
        List<BookingEntity> bookings = bookingRepository.findActiveBookingsOnDate(
                today,
                java.util.List.of(BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS, BookingStatus.PENDING));
        return toResponseDTOList(bookings);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getConfirmedBookings() {
        log.debug("Fetching confirmed bookings");
        List<BookingEntity> bookings = bookingRepository.findByStatus(BookingStatus.CONFIRMED);
        return toResponseDTOList(bookings);
    }

    @Override
    public BookingResponseDTO approveBooking(Long bookingId) {
        log.info("Approving booking ID: {}", bookingId);
        BookingEntity booking = findBookingOrThrow(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be approved");
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        BookingEntity saved = bookingRepository.save(booking);
        return toResponseDTO(saved);
    }

    @Override
    public BookingResponseDTO rejectBooking(Long bookingId, String reason) {
        log.info("Rejecting booking ID: {} with reason: {}", bookingId, reason);
        BookingEntity booking = findBookingOrThrow(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be rejected");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setNotes(reason);
        BookingEntity saved = bookingRepository.save(booking);
        return toResponseDTO(saved);
    }

    // ==================== Staff Assignment ====================

    @Override
    @Transactional(readOnly = true)
    public List<StaffListDTO> getAvailableStaff() {
        log.debug("Fetching available staff");
        // Simplified fetching strategy for now: Filter all users
        List<UserEntity> staff = userRepository.findAll().stream()
                .filter(u -> {
                    if (u.getRole() == null)
                        return false;
                    String roleName = u.getRole().getRoleName();
                    // Check for ROLE_STAFF, STAFF, or Operator roles
                    return "ROLE_STAFF".equals(roleName) || "STAFF".equals(roleName) ||
                            "ROLE_OPERATOR".equals(roleName) || "OPERATOR".equals(roleName);
                })
                .collect(Collectors.toList());

        return staff.stream()
                .map(this::toStaffListDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffListDTO> getAvailableDrivers() {
        log.debug("Fetching available drivers");
        // Drivers are users with ROLE_DRIVER
        List<UserEntity> drivers = userRepository.findAll().stream()
                .filter(u -> {
                    if (u.getRole() == null)
                        return false;
                    String roleName = u.getRole().getRoleName();
                    // User explicitly requested adding ROLE_DRIVER logic
                    return "ROLE_DRIVER".equals(roleName) || "DRIVER".equals(roleName);
                })
                .collect(Collectors.toList());

        return drivers.stream()
                .map(this::toStaffListDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponseDTO assignStaff(Long bookingId, Long staffId, Long driverId, Long operatorId) {
        log.info("Assigning staff {} and driver {} to booking {}", staffId, driverId, bookingId);
        BookingEntity booking = findBookingOrThrow(bookingId);

        // Validate Rental Type Constraints
        String rentalType = booking.getRentalType() != null ? booking.getRentalType().getName() : "Self Drive";
        if ("Self Drive".equalsIgnoreCase(rentalType) && driverId != null) {
            throw new IllegalArgumentException("Cannot assign a driver to a Self Drive booking");
        }
        if (("With Driver".equalsIgnoreCase(rentalType) || "WITH_DRIVER".equalsIgnoreCase(rentalType))
                && driverId == null && booking.getDriverId() == null) {
            // Note: We allow partial updates, so only error if we are trying to clear
            // driver or not providing one when none exists?
            // Actually, frontend validation handles requirement. Backend should just
            // prevent 'Self Drive' + Driver.
            // For 'With Driver', we might want to enforce it, but let's be flexible for
            // partial updates.
        }

        if (staffId != null) {
            // Verify staff exists
            userRepository.findById(staffId)
                    .orElseThrow(() -> new ResourceNotFoundException("Staff not found with ID: " + staffId));
            booking.setAssignedStaffId(staffId);
        }

        if (driverId != null) {
            // Verify driver exists and has valid license
            UserEntity driver = userRepository.findById(driverId)
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + driverId));
            if (driver.getLicenseStatus() != LicenseStatus.APPROVED) {
                throw new IllegalStateException("Driver does not have an approved license");
            }
            booking.setDriverId(driverId);
        }

        booking.setAssignedAt(LocalDateTime.now());
        booking.setAssignedBy(operatorId);

        BookingEntity saved = bookingRepository.save(booking);
        return toResponseDTO(saved);
    }

    @Override
    public BookingResponseDTO unassignStaff(Long bookingId) {
        log.info("Removing staff assignment from booking {}", bookingId);
        BookingEntity booking = findBookingOrThrow(bookingId);

        booking.setAssignedStaffId(null);
        booking.setDriverId(null);
        booking.setAssignedAt(null);
        booking.setAssignedBy(null);

        BookingEntity saved = bookingRepository.save(booking);
        return toResponseDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getStaffAssignedBookings(Long staffId) {
        log.info("Fetching bookings assigned to staff {}", staffId);
        List<BookingEntity> bookings = bookingRepository.findByAssignedStaffId(staffId);
        return bookings.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // ==================== License Verification ====================

    @Override
    @Transactional(readOnly = true)
    public List<UserLicenseDTO> getPendingLicenses() {
        log.debug("Fetching users with pending licenses");
        List<UserEntity> users = userRepository.findByLicenseStatus(LicenseStatus.PENDING);
        return users.stream()
                .map(this::toUserLicenseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserLicenseDTO approveLicense(Long userId) {
        log.info("Approving license for user ID: {}", userId);
        UserEntity user = findUserOrThrow(userId);

        if (user.getLicenseStatus() != LicenseStatus.PENDING) {
            throw new IllegalStateException("Only PENDING licenses can be approved");
        }

        user.setLicenseStatus(LicenseStatus.APPROVED);
        UserEntity saved = userRepository.save(user);
        return toUserLicenseDTO(saved);
    }

    @Override
    public UserLicenseDTO rejectLicense(Long userId, String reason) {
        log.info("Rejecting license for user ID: {} with reason: {}", userId, reason);
        UserEntity user = findUserOrThrow(userId);

        if (user.getLicenseStatus() != LicenseStatus.PENDING) {
            throw new IllegalStateException("Only PENDING licenses can be rejected");
        }

        user.setLicenseStatus(LicenseStatus.REJECTED);
        // Note: Could store rejection reason if we add a field for it
        UserEntity saved = userRepository.save(user);
        return toUserLicenseDTO(saved);
    }

    // ==================== Dashboard Stats ====================

    @Override
    @Transactional(readOnly = true)
    public OperatorDashboardStats getDashboardStats() {
        log.debug("Fetching operator dashboard stats");

        long pendingBookings = bookingRepository.countByStatus(BookingStatus.PENDING);
        long todayBookings = bookingRepository.findByStartDate(LocalDate.now()).size();
        long pendingLicenses = userRepository.countByLicenseStatus(LicenseStatus.PENDING);
        long inProgressBookings = bookingRepository.countByStatus(BookingStatus.IN_PROGRESS);
        long availableStaff = getAvailableStaff().size();
        long availableDrivers = getAvailableDrivers().size();

        // Calculate totals
        List<String> staffRoles = java.util.List.of("ROLE_STAFF", "STAFF", "ROLE_OPERATOR", "OPERATOR");
        long totalStaff = userRepository.countByRole_RoleNameIn(staffRoles);

        // Calculate total drivers (users with ROLE_DRIVER)
        long totalDrivers = userRepository.findAll().stream()
                .filter(u -> {
                    if (u.getRole() == null)
                        return false;
                    String r = u.getRole().getRoleName();
                    return "ROLE_DRIVER".equals(r) || "DRIVER".equals(r);
                })
                .count();

        return new OperatorDashboardStats(
                pendingBookings,
                todayBookings,
                pendingLicenses,
                inProgressBookings,
                availableStaff,
                availableDrivers);
    }

    // ==================== Helper Methods ====================

    private BookingEntity findBookingOrThrow(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
    }

    private UserEntity findUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
    }

    private BookingResponseDTO toResponseDTO(BookingEntity entity) {
        BookingResponseDTO dto = bookingMapper.toResponseDTO(entity);

        // Add assignment details
        dto.setAssignedStaffId(entity.getAssignedStaffId());
        dto.setAssignedAt(entity.getAssignedAt());
        dto.setDriverId(entity.getDriverId());

        // Map Rental Type
        if (entity.getRentalType() != null) {
            dto.setRentalTypeId(entity.getRentalType().getId());
            dto.setRentalTypeName(entity.getRentalType().getName());
        } else {
            // Default fallback if null
            dto.setRentalTypeName("Self Drive");
        }

        // Resolve staff name
        if (entity.getAssignedStaffId() != null) {
            userRepository.findById(entity.getAssignedStaffId())
                    .ifPresent(staff -> dto.setAssignedStaffName(staff.getFullName()));
        }

        // Resolve driver name
        if (entity.getDriverId() != null) {
            userRepository.findById(entity.getDriverId())
                    .ifPresent(driver -> dto.setDriverName(driver.getFullName()));
        }

        // Resolve assigned by name
        if (entity.getAssignedBy() != null) {
            userRepository.findById(entity.getAssignedBy())
                    .ifPresent(operator -> dto.setAssignedByName(operator.getFullName()));
        }

        return dto;
    }

    private List<BookingResponseDTO> toResponseDTOList(List<BookingEntity> entities) {
        return entities.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    private StaffListDTO toStaffListDTO(UserEntity user) {
        // Count current active assignments using optimized query
        int currentAssignments = bookingRepository.countActiveBookingsByStaff(
                user.getId(),
                java.util.List.of(BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS));

        return StaffListDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole() != null ? user.getRole().getRoleName() : null)
                .currentAssignments(currentAssignments)
                .available(currentAssignments < 5) // Max 5 concurrent assignments
                .build();
    }

    private UserLicenseDTO toUserLicenseDTO(UserEntity user) {
        return UserLicenseDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .licenseNumber(user.getLicenseNumber())
                .licenseType(user.getLicenseType())
                .dateOfBirth(user.getDateOfBirth())
                .licenseFrontImageUrl(user.getLicenseFrontImageUrl())
                .licenseStatus(user.getLicenseStatus())
                .role(user.getRole() != null ? user.getRole().getRoleName() : null)
                .build();
    }
}
