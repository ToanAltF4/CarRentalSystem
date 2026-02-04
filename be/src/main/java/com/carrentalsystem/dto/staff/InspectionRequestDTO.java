package com.carrentalsystem.dto.staff;

import com.carrentalsystem.entity.ConditionRating;
import com.carrentalsystem.entity.InspectionType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InspectionRequestDTO {
    private Long bookingId;
    private InspectionType type; // PICKUP or RETURN
    private Integer batteryLevel;
    private Integer odometer;
    private Boolean chargingCablePresent;
    private ConditionRating exteriorCondition; // Using Enum name like "GOOD", "DAMAGED"
    private ConditionRating interiorCondition;
    private Boolean hasDamage;
    private String damageDescription;
    private String damagePhotos; // Comma separated URLs or JSON
    private String inspectionNotes;
}
