package com.carrentalsystem.dto.vehicle;

import jakarta.validation.constraints.*;
import lombok.*;

/**
 * Request DTO for creating/updating a physical Vehicle.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleRequestDTO {

    @NotNull(message = "Vehicle category ID is required")
    private Long vehicleCategoryId;

    @NotBlank(message = "License plate is required")
    @Size(max = 20, message = "License plate must not exceed 20 characters")
    private String licensePlate;

    @Size(max = 50, message = "VIN must not exceed 50 characters")
    private String vin;

    @PositiveOrZero(message = "Odometer must be zero or positive")
    private Integer odometer;

    @Min(value = 0, message = "Battery percent must be at least 0")
    @Max(value = 100, message = "Battery percent must be at most 100")
    private Integer currentBatteryPercent;
}
