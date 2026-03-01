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

import java.time.format.DateTimeParseException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
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

    private static final List<String> STAFF_ROLE_NAMES = List.of("ROLE_STAFF", "STAFF", "ROLE_OPERATOR", "OPERATOR");
    private static final List<String> DRIVER_ROLE_NAMES = List.of("ROLE_DRIVER", "DRIVER");
    private static final List<BookingStatus> ACTIVE_ASSIGNMENT_STATUSES = List.of(
            BookingStatus.ASSIGNED,
            BookingStatus.CONFIRMED,
            BookingStatus.IN_PROGRESS,
            BookingStatus.ONGOING);
    private static final List<BookingStatus> TODAY_OPERATION_STATUSES = List.of(
            BookingStatus.PENDING,
            BookingStatus.CONFIRMED,
            BookingStatus.ASSIGNED,
            BookingStatus.IN_PROGRESS,
            BookingStatus.ONGOING);

    // ==================== Booking Management ====================

    // ==================== Booking Management ====================

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getTodayBookings() {
        log.debug("Fetching today's bookings (active)");
        LocalDate today = LocalDate.now();
        List<BookingEntity> bookings = bookingRepository.findByStatusesAndDateOverlapWithDetails(
                TODAY_OPERATION_STATUSES,
                today).stream()
                .filter(booking -> isBookedOnDate(booking, today))
                .toList();
        return toResponseDTOList(bookings);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getConfirmedBookings() {
        log.debug("Fetching confirmed bookings");
        List<BookingEntity> bookings = bookingRepository.findByStatusWithDetails(BookingStatus.CONFIRMED);
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
        List<UserEntity> staff = userRepository.findByRole_RoleNameIn(STAFF_ROLE_NAMES);
        Map<Long, Integer> assignmentCountMap = loadAssignmentCountMap(
                staff.stream().map(UserEntity::getId).toList());

        return staff.stream()
                .map(user -> toStaffListDTO(user, assignmentCountMap))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffListDTO> getAvailableDrivers() {
        log.debug("Fetching available drivers");
        List<UserEntity> drivers = userRepository.findByRole_RoleNameIn(DRIVER_ROLE_NAMES);
        Map<Long, Integer> assignmentCountMap = loadAssignmentCountMap(
                drivers.stream().map(UserEntity::getId).toList());

        return drivers.stream()
                .map(user -> toStaffListDTO(user, assignmentCountMap))
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

        // Update status to ASSIGNED to indicate it's been handled by operator
        // But only if it was CONFIRMED (don't downgrade from IN_PROGRESS)
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            booking.setStatus(BookingStatus.ASSIGNED);
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
        List<BookingEntity> bookings = bookingRepository.findByAssignedStaffIdWithDetails(staffId);
        return bookings.stream()
                .map(this::toResponseDTO)
                .toList();
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
        LocalDate today = LocalDate.now();
        long todayBookings = bookingRepository.findByStatusesAndDateOverlapWithDetails(
                TODAY_OPERATION_STATUSES,
                today).stream()
                .filter(booking -> isBookedOnDate(booking, today))
                .count();
        long pendingLicenses = userRepository.countByLicenseStatus(LicenseStatus.PENDING);
        long inProgressBookings = bookingRepository.countByStatus(BookingStatus.IN_PROGRESS);
        List<UserEntity> staff = userRepository.findByRole_RoleNameIn(STAFF_ROLE_NAMES);
        List<UserEntity> drivers = userRepository.findByRole_RoleNameIn(DRIVER_ROLE_NAMES);
        Map<Long, Integer> staffAssignments = loadAssignmentCountMap(staff.stream().map(UserEntity::getId).toList());
        Map<Long, Integer> driverAssignments = loadAssignmentCountMap(drivers.stream().map(UserEntity::getId).toList());
        long availableStaff = staff.stream().filter(u -> staffAssignments.getOrDefault(u.getId(), 0) < 5).count();
        long availableDrivers = drivers.stream().filter(u -> driverAssignments.getOrDefault(u.getId(), 0) < 5).count();

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
        return toResponseDTO(entity, null);
    }

    private BookingResponseDTO toResponseDTO(BookingEntity entity, Map<Long, UserEntity> userMap) {
        BookingResponseDTO dto = bookingMapper.toResponseDTO(entity);

        java.util.function.Function<Long, UserEntity> resolveUser = (id) -> {
            if (id == null) {
                return null;
            }
            if (userMap != null && userMap.containsKey(id)) {
                return userMap.get(id);
            }
            return userRepository.findById(id).orElse(null);
        };

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
        UserEntity staff = resolveUser.apply(entity.getAssignedStaffId());
        if (staff != null) {
            dto.setAssignedStaffName(staff.getFullName());
        }

        // Resolve driver name
        UserEntity driver = resolveUser.apply(entity.getDriverId());
        if (driver != null) {
            dto.setDriverName(driver.getFullName());
        }

        // Resolve assigned by name
        UserEntity operator = resolveUser.apply(entity.getAssignedBy());
        if (operator != null) {
            dto.setAssignedByName(operator.getFullName());
        }
        dto.setSelectedDates(resolveSelectedDatesFromBooking(entity));

        return dto;
    }

    private List<BookingResponseDTO> toResponseDTOList(List<BookingEntity> entities) {
        if (entities == null || entities.isEmpty()) {
            return List.of();
        }

        Set<Long> userIds = entities.stream()
                .flatMap(b -> java.util.stream.Stream.of(b.getAssignedStaffId(), b.getDriverId(), b.getAssignedBy()))
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, UserEntity> userMap = userIds.isEmpty()
                ? Map.of()
                : userRepository.findAllById(userIds).stream()
                        .collect(Collectors.toMap(UserEntity::getId, u -> u));

        return entities.stream()
                .map(entity -> toResponseDTO(entity, userMap))
                .toList();
    }

    private StaffListDTO toStaffListDTO(UserEntity user, Map<Long, Integer> assignmentCountMap) {
        int currentAssignments = assignmentCountMap.getOrDefault(user.getId(), 0);

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

    private Map<Long, Integer> loadAssignmentCountMap(List<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Map.of();
        }

        Map<Long, Integer> countMap = new HashMap<>();

        bookingRepository.countActiveAssignmentsGroupedByAssignedStaff(userIds)
                .forEach(row -> countMap.put(
                        row.getUserId(),
                        (int) (row.getCount() != null ? row.getCount() : 0L)));

        bookingRepository.countActiveAssignmentsGroupedByDriver(userIds)
                .forEach(row -> countMap.merge(
                        row.getUserId(),
                        (int) (row.getCount() != null ? row.getCount() : 0L),
                        Integer::sum));

        return countMap;
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

    private boolean isBookedOnDate(BookingEntity booking, LocalDate date) {
        return resolveSelectedDatesFromBooking(booking).contains(date);
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
