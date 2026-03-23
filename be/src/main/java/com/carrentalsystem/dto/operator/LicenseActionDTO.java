package com.carrentalsystem.dto.operator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for license rejection with reason.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LicenseActionDTO {
    private String reason;
}
