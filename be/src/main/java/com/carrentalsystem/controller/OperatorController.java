package com.carrentalsystem.controller;

import com.carrentalsystem.dto.booking.BookingResponseDTO;
import com.carrentalsystem.dto.operator.BookingAssignmentDTO;
import com.carrentalsystem.dto.operator.LicenseActionDTO;
import com.carrentalsystem.dto.operator.StaffListDTO;
import com.carrentalsystem.dto.operator.UserLicenseDTO;
import com.carrentalsystem.entity.UserEntity;
import com.carrentalsystem.service.OperatorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/operator")
@RequiredArgsConstructor
@Tag(name = "Operator", description = "Operator Role API")
public class OperatorController {

    private final OperatorService operatorService;

    // ==================== Booking Management ====================

    @GetMapping("/bookings/today")
    @Operation(summary = "Get today's bookings")
    public ResponseEntity<List<BookingResponseDTO>> getTodayBookings() {
        return ResponseEntity.ok(operatorService.getTodayBookings());
    }

    @GetMapping("/bookings/confirmed")
    @Operation(summary = "Get confirmed bookings (ready for assignment)")
    public ResponseEntity<List<BookingResponseDTO>> getConfirmedBookings() {
        return ResponseEntity.ok(operatorService.getConfirmedBookings());
    }

    @PostMapping("/bookings/{id}/approve")
    @Operation(summary = "Approve a booking")
    public ResponseEntity<BookingResponseDTO> approveBooking(@PathVariable Long id) {
        return ResponseEntity.ok(operatorService.approveBooking(id));
    }

    @PostMapping("/bookings/{id}/reject")
    @Operation(summary = "Reject a booking")
    public ResponseEntity<BookingResponseDTO> rejectBooking(
            @PathVariable Long id,
            @RequestBody(required = false) LicenseActionDTO reasonDto) {
        String reason = reasonDto != null ? reasonDto.getReason() : "Rejected by operator";
        return ResponseEntity.ok(operatorService.rejectBooking(id, reason));
    }

    // ==================== Staff Assignment ====================

    @GetMapping("/staff/available")
    @Operation(summary = "Get available staff")
    public ResponseEntity<List<StaffListDTO>> getAvailableStaff() {
        return ResponseEntity.ok(operatorService.getAvailableStaff());
    }

    @GetMapping("/drivers/available")
    @Operation(summary = "Get available drivers")
    public ResponseEntity<List<StaffListDTO>> getAvailableDrivers() {
        return ResponseEntity.ok(operatorService.getAvailableDrivers());
    }

    @PostMapping("/bookings/{id}/assign")
    @Operation(summary = "Assign staff/driver to booking")
    public ResponseEntity<BookingResponseDTO> assignStaff(
            @PathVariable Long id,
            @RequestBody BookingAssignmentDTO assignment,
            @AuthenticationPrincipal UserEntity currentUser) {
        // Note: AuthenticationPrincipal might need adjustment based on how UserDetails
        // is implemented
        // For now assuming we can get ID from security context, or pass it if needed
        Long operatorId = currentUser != null ? currentUser.getId() : null;

        return ResponseEntity.ok(operatorService.assignStaff(
                id,
                assignment.getStaffId(),
                assignment.getDriverId(),
                operatorId));
    }

    @DeleteMapping("/bookings/{id}/assign")
    @Operation(summary = "Remove staff assignment")
    public ResponseEntity<BookingResponseDTO> unassignStaff(@PathVariable Long id) {
        return ResponseEntity.ok(operatorService.unassignStaff(id));
    }

    @GetMapping("/staff/{staffId}/bookings")
    @Operation(summary = "Get bookings assigned to a staff member")
    public ResponseEntity<List<BookingResponseDTO>> getStaffAssignedBookings(@PathVariable Long staffId) {
        return ResponseEntity.ok(operatorService.getStaffAssignedBookings(staffId));
    }

    // ==================== License Verification ====================

    @GetMapping("/licenses/pending")
    @Operation(summary = "Get pending licenses")
    public ResponseEntity<List<UserLicenseDTO>> getPendingLicenses() {
        return ResponseEntity.ok(operatorService.getPendingLicenses());
    }

    @PostMapping("/users/{id}/approve-license")
    @Operation(summary = "Approve driver license")
    public ResponseEntity<UserLicenseDTO> approveLicense(@PathVariable Long id) {
        return ResponseEntity.ok(operatorService.approveLicense(id));
    }

    @PostMapping("/users/{id}/reject-license")
    @Operation(summary = "Reject driver license")
    public ResponseEntity<UserLicenseDTO> rejectLicense(
            @PathVariable Long id,
            @RequestBody(required = false) LicenseActionDTO reasonDto) {
        String reason = reasonDto != null ? reasonDto.getReason() : "Rejected by operator";
        return ResponseEntity.ok(operatorService.rejectLicense(id, reason));
    }

    // ==================== Dashboard Stats ====================

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<OperatorService.OperatorDashboardStats> getDashboardStats() {
        return ResponseEntity.ok(operatorService.getDashboardStats());
    }
}
