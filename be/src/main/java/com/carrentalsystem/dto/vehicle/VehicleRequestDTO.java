package com.carrentalsystem.dto.vehicle;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Request DTO for creating/updating a Vehicle.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleRequestDTO {

    @NotBlank(message = "Vehicle name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Model is required")
    @Size(max = 100, message = "Model must not exceed 100 characters")
    private String model;

    @NotBlank(message = "Brand is required")
    @Size(max = 50, message = "Brand must not exceed 50 characters")
    private String brand;

    @NotBlank(message = "License plate is required")
    @Size(max = 20, message = "License plate must not exceed 20 characters")
    private String licensePlate;

    @Positive(message = "Battery capacity must be positive")
    @DecimalMax(value = "999.99", message = "Battery capacity must not exceed 999.99 kWh")
    private BigDecimal batteryCapacityKwh;

    @Positive(message = "Range must be positive")
    @Max(value = 9999, message = "Range must not exceed 9999 km")
    private Integer rangeKm;

    @Positive(message = "Charging time must be positive")
    @DecimalMax(value = "99.99", message = "Charging time must not exceed 99.99 hours")
    private BigDecimal chargingTimeHours;

    @NotNull(message = "Daily rate is required")
    @Positive(message = "Daily rate must be positive")
    @DecimalMax(value = "99999999.99", message = "Daily rate is too high")
    private BigDecimal dailyRate;

    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    private String imageUrl;

    // New Fields
    @NotBlank(message = "Category is required")
    private String category;

    @Positive(message = "Seats must be positive")
    private Integer seats;

    private String description;
}
