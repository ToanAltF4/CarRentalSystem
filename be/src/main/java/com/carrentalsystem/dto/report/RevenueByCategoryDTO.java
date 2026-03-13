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
public class RevenueByCategoryDTO {
    private String categoryName;
    private String brand;
    private BigDecimal revenue;
    private Long bookingCount;
}
