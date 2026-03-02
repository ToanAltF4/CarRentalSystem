package com.carrentalsystem.entity.converter;

import com.carrentalsystem.entity.VehicleStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class VehicleStatusConverter implements AttributeConverter<VehicleStatus, String> {

    @Override
    public String convertToDatabaseColumn(VehicleStatus attribute) {
        return attribute != null ? attribute.name() : null;
    }

    @Override
    public VehicleStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        String normalized = dbData.trim();
        if (normalized.isEmpty()) {
            return null;
        }
        try {
            if (normalized.chars().allMatch(Character::isDigit)) {
                return VehicleStatus.fromId(Integer.parseInt(normalized));
            }
            return VehicleStatus.valueOf(normalized.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
