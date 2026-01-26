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
        return dbData != null ? VehicleStatus.valueOf(dbData) : null;
    }
}
