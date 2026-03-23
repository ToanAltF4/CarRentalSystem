package com.carrentalsystem.dto.vehicle;

import com.carrentalsystem.entity.VehicleStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for Vehicle data returned to clients.
 * Includes denormalized category info and active pricing.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponseDTO {

    private Long id;
    private String licensePlate;
    private VehicleStatus status;
    private String vin;
    private Integer odometer;
    private Integer currentBatteryPercent;

    // Category info (denormalized)
    private Long categoryId;
    private String categoryBrand;
    private String categoryName;
    private String categoryModel;
    private Integer seats;
    private BigDecimal batteryCapacityKwh;
    private Integer rangeKm;
    private BigDecimal chargingTimeHours;
    private String description;
    private String imageUrl; // Primary image from category

    // Pricing info (from active pricing of category)
    private BigDecimal dailyPrice;
    private BigDecimal weeklyPrice;
    private BigDecimal monthlyPrice;
    private BigDecimal overtimeFeePerHour;

    // Legacy compatibility fields
    private String name; // = categoryName
    private String model; // = categoryModel
    private String brand; // = categoryBrand
    private BigDecimal dailyRate; // = dailyPrice

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}
