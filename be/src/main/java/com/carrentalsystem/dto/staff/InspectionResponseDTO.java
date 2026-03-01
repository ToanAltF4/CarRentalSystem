package com.carrentalsystem.dto.staff;

import com.carrentalsystem.entity.ConditionRating;
import com.carrentalsystem.entity.InspectionType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class InspectionResponseDTO {
    private Long id;
    private Long bookingId;
    private InspectionType type;
    private Integer batteryLevel;
    private Integer odometer;
    private Boolean chargingCablePresent;
    private ConditionRating exteriorCondition;
    private ConditionRating interiorCondition;
    private Boolean hasDamage;
    private String damageDescription;
    private String inspectionNotes;
    private Long inspectedById;
    private LocalDateTime inspectedAt;
    private LocalDateTime createdAt;
}
