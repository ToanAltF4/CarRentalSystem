package com.carrentalsystem.dto.vehicle;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for unavailable date ranges of a specific vehicle.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleUnavailableDateRangeDTO {
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
}
