package com.carrentalsystem.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopVehicleDTO {
    private Long vehicleId;
    private String categoryName;
    private String brand;
    private String licensePlate;
    private Long bookingCount;
    private BigDecimal totalRevenue;
}
