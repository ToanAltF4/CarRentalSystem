package com.carrentalsystem.entity.converter;

import com.carrentalsystem.entity.VehicleStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class VehicleStatusConverter implements AttributeConverter<VehicleStatus, Integer> {

    @Override
    public Integer convertToDatabaseColumn(VehicleStatus attribute) {
        return attribute != null ? attribute.getId() : null;
    }

    @Override
    public VehicleStatus convertToEntityAttribute(Integer dbData) {
        return VehicleStatus.fromId(dbData);
    }
}
