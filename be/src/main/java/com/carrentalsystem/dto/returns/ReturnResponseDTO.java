package com.carrentalsystem.dto.returns;

import com.carrentalsystem.entity.ConditionRating;
import com.carrentalsystem.entity.PaymentStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO for completed return with inspection and invoice details.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReturnResponseDTO {

    // Booking info
    private Long bookingId;
    private String bookingCode;

    // Vehicle info
    private Long vehicleId;
    private String vehicleName;
    private String vehicleLicensePlate;

    // Customer info
    private String customerName;
    private String customerEmail;

    // Rental period
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime actualReturnDate;

    // Inspection details
    private Long inspectionId;
    private Integer batteryLevel;
    private Integer odometer;
    private Boolean chargingCablePresent;
    private ConditionRating exteriorCondition;
    private ConditionRating interiorCondition;
    private Boolean hasDamage;
    private String damageDescription;

    // Invoice details
    private Long invoiceId;
    private String invoiceNumber;

    // Fee breakdown
    private Integer totalDays;
    private BigDecimal dailyRate;
    private BigDecimal rentalFee;

    private Integer overtimeHours;
    private BigDecimal overtimeFeePerHour;
    private BigDecimal overtimeFee;

    private BigDecimal damageFee;
    private BigDecimal deliveryFee;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;

    private BigDecimal subtotal;
    private BigDecimal totalAmount;

    private PaymentStatus paymentStatus;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime issuedAt;
}
