package com.carrentalsystem.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Request DTO for creating a new booking.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequestDTO {
    private Long vehicleId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private LocalDate startDate;
    private LocalDate endDate;
    private String notes;

    // For booking by Model (system assigns specific vehicle)
    private String brand;
    private String model;

    // Rental type selection (required)
    // 1 = SELF_DRIVE, 2 = WITH_DRIVER
    private Integer rentalTypeId;

    // Pickup method selection (only for SELF_DRIVE)
    // 1 = STORE, 2 = DELIVERY
    // NULL for WITH_DRIVER
    private Integer pickupMethodId;

    // Delivery address (only when pickupMethodId = 2/DELIVERY)
    private String deliveryAddress;
}
