package com.carrentalsystem.dto.returns;

import com.carrentalsystem.entity.ConditionRating;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Request DTO for processing a vehicle return.
 * Includes inspection data and fee inputs.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReturnRequestDTO {

    @NotNull(message = "Battery level is required")
    @Min(value = 0, message = "Battery level must be between 0 and 100")
    @Max(value = 100, message = "Battery level must be between 0 and 100")
    private Integer batteryLevel;

    @NotNull(message = "Odometer reading is required")
    @PositiveOrZero(message = "Odometer must be zero or positive")
    private Integer odometer;

    @Builder.Default
    private Boolean chargingCablePresent = true;

    @Builder.Default
    private ConditionRating exteriorCondition = ConditionRating.GOOD;

    @Builder.Default
    private ConditionRating interiorCondition = ConditionRating.GOOD;

    @Builder.Default
    private Boolean hasDamage = false;

    @Size(max = 1000, message = "Damage description must not exceed 1000 characters")
    private String damageDescription;

    /**
     * If damage is reported, this is the estimated cost
     */
    @PositiveOrZero(message = "Damage fee must be zero or positive")
    private BigDecimal damageFee;

    /**
     * Optional delivery fee
     */
    @PositiveOrZero(message = "Delivery fee must be zero or positive")
    private BigDecimal deliveryFee;

    @Size(max = 100, message = "Inspector name must not exceed 100 characters")
    private String inspectedBy;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String inspectionNotes;
}
