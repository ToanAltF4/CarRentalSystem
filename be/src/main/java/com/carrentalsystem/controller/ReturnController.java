package com.carrentalsystem.controller;

import com.carrentalsystem.dto.returns.ReturnRequestDTO;
import com.carrentalsystem.dto.returns.ReturnResponseDTO;
import com.carrentalsystem.service.ReturnService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for vehicle return and inspection operations.
 */
@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Tag(name = "Returns", description = "Vehicle Return & Inspection API")
public class ReturnController {

    private final ReturnService returnService;

    @PostMapping("/{bookingId}/return")
    @Operation(summary = "Process vehicle return", description = "Process the return of a rented vehicle. " +
            "Creates inspection record, calculates overtime/damage fees, " +
            "generates invoice, and updates booking & vehicle status.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Return processed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request or booking cannot be returned"),
            @ApiResponse(responseCode = "404", description = "Booking not found")
    })
    public ResponseEntity<ReturnResponseDTO> processReturn(
            @Parameter(description = "Booking ID") @PathVariable Long bookingId,
            @Valid @RequestBody ReturnRequestDTO request) {
        ReturnResponseDTO response = returnService.processReturn(bookingId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{bookingId}/return")
    @Operation(summary = "Get return details", description = "Get the return details including inspection and invoice for a completed booking")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Return details found"),
            @ApiResponse(responseCode = "404", description = "Return not found for this booking")
    })
    public ResponseEntity<ReturnResponseDTO> getReturnDetails(
            @Parameter(description = "Booking ID") @PathVariable Long bookingId,
            Authentication authentication) {
        boolean privileged = isPrivileged(authentication);
        String email = authentication != null ? authentication.getName() : null;
        ReturnResponseDTO response = returnService.getReturnByBookingId(bookingId, email, privileged);
        return ResponseEntity.ok(response);
    }

    private boolean isPrivileged(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            String role = authority.getAuthority();
            if ("ROLE_ADMIN".equals(role)
                    || "ROLE_MANAGER".equals(role)
                    || "ROLE_OPERATOR".equals(role)
                    || "ROLE_STAFF".equals(role)) {
                return true;
            }
        }
        return false;
    }
}
