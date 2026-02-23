package com.carrentalsystem.dto.vehiclecategory;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for Vehicle Category data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleCategoryResponseDTO {

    private Long id;
    private String brand;
    private String name;
    private String model;
    private Integer seats;
    private BigDecimal batteryCapacityKwh;
    private Integer rangeKm;
    private BigDecimal chargingTimeHours;
    private String description;

    // Images
    private List<String> imageUrls;
    private String primaryImageUrl;

    // Active pricing
    private BigDecimal dailyPrice;
    private BigDecimal weeklyPrice;
    private BigDecimal monthlyPrice;
    private BigDecimal overtimeFeePerHour;

    // Stats
    private int vehicleCount;
    private int availableCount;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
}
