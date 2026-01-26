package com.carrentalsystem.entity.converter;

import com.carrentalsystem.entity.VehicleStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class VehicleStatusConverter implements AttributeConverter<VehicleStatus, Byte> {

    @Override
    public Byte convertToDatabaseColumn(VehicleStatus attribute) {
        return attribute != null ? (byte) attribute.getId() : null;
    }

    @Override
    public VehicleStatus convertToEntityAttribute(Byte dbData) {
        return VehicleStatus.fromId(dbData != null ? dbData.intValue() : null);
    }
}
