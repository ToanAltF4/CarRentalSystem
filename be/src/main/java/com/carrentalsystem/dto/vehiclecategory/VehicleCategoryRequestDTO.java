package com.carrentalsystem.dto.vehiclecategory;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request DTO for creating/updating a Vehicle Category.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleCategoryRequestDTO {

    @NotBlank(message = "Brand is required")
    @Size(max = 80, message = "Brand must not exceed 80 characters")
    private String brand;

    @NotBlank(message = "Name (line) is required")
    @Size(max = 120, message = "Name must not exceed 120 characters")
    private String name;

    @NotBlank(message = "Model (variant) is required")
    @Size(max = 120, message = "Model must not exceed 120 characters")
    private String model;

    @Positive(message = "Seats must be positive")
    private Integer seats;

    @Positive(message = "Battery capacity must be positive")
    private BigDecimal batteryCapacityKwh;

    @Positive(message = "Range must be positive")
    private Integer rangeKm;

    @Positive(message = "Charging time must be positive")
    private BigDecimal chargingTimeHours;

    private String description;

    // Images
    private List<String> imageUrls;

    // Pricing (will create/update active pricing)
    @NotNull(message = "Daily price is required")
    @Positive(message = "Daily price must be positive")
    private BigDecimal dailyPrice;

    private BigDecimal weeklyPrice;
    private BigDecimal monthlyPrice;

    @NotNull(message = "Overtime fee is required")
    @Positive(message = "Overtime fee must be positive")
    private BigDecimal overtimeFeePerHour;
}
