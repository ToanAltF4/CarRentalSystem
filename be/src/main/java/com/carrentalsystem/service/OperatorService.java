package com.carrentalsystem.service;

import com.carrentalsystem.dto.booking.BookingResponseDTO;
import com.carrentalsystem.dto.operator.BookingAssignmentDTO;
import com.carrentalsystem.dto.operator.StaffListDTO;
import com.carrentalsystem.dto.operator.UserLicenseDTO;

import java.util.List;

/**
 * Service interface for Operator operations.
 * Handles booking management, staff assignment, and license verification.
 */
public interface OperatorService {

    // ==================== Booking Management ====================

    // ==================== Booking Management ====================

    /**
     * Get all bookings scheduled for today
     */
    List<BookingResponseDTO> getTodayBookings();

    /**
     * Get all confirmed bookings (ready for assignment)
     */
    List<BookingResponseDTO> getConfirmedBookings();

    /**
     * Approve a pending booking
     */
    BookingResponseDTO approveBooking(Long bookingId);

    /**
     * Reject a pending booking with a reason
     */
    BookingResponseDTO rejectBooking(Long bookingId, String reason);

    // ==================== Staff Assignment ====================

    /**
     * Get list of available staff for delivery/pickup
     */
    List<StaffListDTO> getAvailableStaff();

    /**
     * Get list of available drivers for chauffeur service
     */
    List<StaffListDTO> getAvailableDrivers();

    /**
     * Assign staff/driver to a booking
     */
    BookingResponseDTO assignStaff(Long bookingId, Long staffId, Long driverId, Long operatorId);

    /**
     * Remove staff assignment from a booking
     */
    BookingResponseDTO unassignStaff(Long bookingId);

    /**
     * Get bookings assigned to a specific staff member
     */
    List<BookingResponseDTO> getStaffAssignedBookings(Long staffId);

    // ==================== License Verification ====================

    /**
     * Get all users with pending license verification
     */
    List<UserLicenseDTO> getPendingLicenses();

    /**
     * Approve a user's driver license
     */
    UserLicenseDTO approveLicense(Long userId);

    /**
     * Reject a user's driver license with a reason
     */
    UserLicenseDTO rejectLicense(Long userId, String reason);

    // ==================== Dashboard Stats ====================

    /**
     * Get dashboard statistics for operator
     */
    OperatorDashboardStats getDashboardStats();

    /**
     * Dashboard stats record
     */
    record OperatorDashboardStats(
            long pendingBookings,
            long todayBookings,
            long pendingLicenses,
            long inProgressBookings,
            long availableStaff,
            long availableDrivers) {
    }
}
