package com.carrentalsystem.dto.returns;

import com.carrentalsystem.entity.ConditionRating;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Request DTO for processing vehicle return.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReturnRequestDTO {

    // Inspection details
    private Integer batteryLevel;
    private Integer odometer;
    private Boolean chargingCablePresent;
    private ConditionRating exteriorCondition;
    private ConditionRating interiorCondition;
    private Boolean hasDamage;
    private String damageDescription;
    private String inspectedBy;
    private String inspectionNotes;

    // Fee details
    private BigDecimal damageFee;
    private BigDecimal deliveryFee;
}
