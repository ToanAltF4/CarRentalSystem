package com.carrentalsystem.dto.booking;

import com.carrentalsystem.entity.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO for booking with vehicle details.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponseDTO {
    private Long id;
    private String bookingCode;

    // Vehicle details
    private Long vehicleId;
    private String vehicleName;
    private String vehicleBrand;
    private String vehicleModel;
    private String vehicleLicensePlate;
    private String vehicleImage;

    // Customer details
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    // Booking details
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalDays;
    private BigDecimal dailyRate;
    private BigDecimal totalAmount;
    private BookingStatus status;
    private String notes;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
