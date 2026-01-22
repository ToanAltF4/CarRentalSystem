package com.carrentalsystem.dto.booking;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Request DTO for creating a booking.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequestDTO {

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotBlank(message = "Customer name is required")
    @Size(max = 100, message = "Customer name must not exceed 100 characters")
    private String customerName;

    @NotBlank(message = "Customer email is required")
    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String customerEmail;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String customerPhone;

    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date must be today or in the future")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Future(message = "End date must be in the future")
    private LocalDate endDate;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
}
