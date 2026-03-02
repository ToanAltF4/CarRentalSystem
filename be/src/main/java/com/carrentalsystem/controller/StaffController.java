package com.carrentalsystem.controller;

import com.carrentalsystem.dto.booking.BookingResponseDTO;
import com.carrentalsystem.dto.staff.InspectionRequestDTO;
import com.carrentalsystem.dto.staff.InspectionResponseDTO;
import com.carrentalsystem.entity.UserEntity;
import com.carrentalsystem.repository.UserRepository;
import com.carrentalsystem.service.StaffService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;
    private final UserRepository userRepository;

    @GetMapping("/tasks")
    @PreAuthorize("hasAnyRole('STAFF', 'OPERATOR', 'ADMIN', 'MANAGER')")
    public ResponseEntity<List<BookingResponseDTO>> getMyTasks() {
        UserEntity currentUser = getCurrentUser();
        // If Admin/Operator, maybe they want to see all tasks?
        // For now, return tasks assigned to the specific user hitting the endpoint.
        return ResponseEntity.ok(staffService.getAssignedTasks(currentUser.getId()));
    }

    @GetMapping("/tasks/history")
    @PreAuthorize("hasAnyRole('STAFF', 'OPERATOR', 'ADMIN', 'MANAGER')")
    public ResponseEntity<List<BookingResponseDTO>> getMyTaskHistory() {
        UserEntity currentUser = getCurrentUser();
        return ResponseEntity.ok(staffService.getAssignedTaskHistory(currentUser.getId()));
    }

    @GetMapping("/tasks/{bookingId}")
    @PreAuthorize("hasAnyRole('STAFF', 'OPERATOR', 'ADMIN', 'MANAGER')")
    public ResponseEntity<BookingResponseDTO> getTaskDetail(@PathVariable Long bookingId) {
        UserEntity currentUser = getCurrentUser();
        return ResponseEntity.ok(staffService.getAssignedTaskDetail(bookingId, currentUser.getId()));
    }

    @PostMapping("/inspection")
    @PreAuthorize("hasAnyRole('STAFF', 'OPERATOR', 'ADMIN', 'MANAGER')")
    public ResponseEntity<InspectionResponseDTO> submitInspection(@RequestBody InspectionRequestDTO request) {
        log.info(
                ">>> [DEBUG] Received inspection request: bookingId={}, type={}, battery={}, odometer={}, exterior={}, interior={}, hasDamage={}",
                request.getBookingId(), request.getType(), request.getBatteryLevel(),
                request.getOdometer(), request.getExteriorCondition(), request.getInteriorCondition(),
                request.getHasDamage());
        UserEntity currentUser = getCurrentUser();
        return ResponseEntity.ok(staffService.submitInspection(request, currentUser.getId()));
    }

    private UserEntity getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
