package com.carrentalsystem.dto.vehicle;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleModelDTO {
    private Long id; // Representative ID
    private String name;
    private String model;
    private String brand;
    private String imageUrl;
    private Integer seats;
    private BigDecimal dailyRate;
    private Integer rangeKm;
    private BigDecimal batteryCapacityKwh;
    private BigDecimal chargingTimeHours;
    private String description;
    private String categoryName;
    private int availableCount;
}
