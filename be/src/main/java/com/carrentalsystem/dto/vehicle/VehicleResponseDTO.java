package com.carrentalsystem.dto.vehicle;

import com.carrentalsystem.entity.VehicleStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for Vehicle data returned to clients.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponseDTO {

    private Long id;
    private String name;
    private String model;
    private String brand;
    private String licensePlate;
    private BigDecimal batteryCapacityKwh;
    private Integer rangeKm;
    private BigDecimal chargingTimeHours;
    private BigDecimal dailyRate;
    private VehicleStatus status;
    private String imageUrl;

    // New fields for complete data
    private Integer seats;
    private String description;
    private Long categoryId; // Category ID for pricing lookup
    private String categoryName; // Category name for display
    private BigDecimal overtimeFeePerHour; // Overtime fee per hour from pricing

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}
