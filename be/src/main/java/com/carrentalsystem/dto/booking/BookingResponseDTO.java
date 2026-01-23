package com.carrentalsystem.dto.booking;

import com.carrentalsystem.entity.BookingStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO for booking data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponseDTO {

    private Long id;
    private String bookingCode;

    // Vehicle info
    private Long vehicleId;
    private String vehicleName;
    private String vehicleBrand;
    private String vehicleModel;
    private String vehicleLicensePlate;
    private String vehicleImage;

    // Customer info
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    // Booking details
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    private Integer totalDays;
    private BigDecimal dailyRate;
    private BigDecimal totalAmount;
    private BookingStatus status;
    private String notes;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}
