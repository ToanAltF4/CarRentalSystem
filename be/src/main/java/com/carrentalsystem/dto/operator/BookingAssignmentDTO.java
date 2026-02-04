package com.carrentalsystem.dto.operator;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for booking assignment operations.
 * Used by operators to assign staff/drivers to bookings.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingAssignmentDTO {

    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    /**
     * Staff ID for delivery/pickup operations
     */
    private Long staffId;

    /**
     * Driver ID for chauffeur service option
     */
    private Long driverId;
}
