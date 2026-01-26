package com.carrentalsystem.entity.converter;

import com.carrentalsystem.entity.LicenseStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class LicenseStatusConverter implements AttributeConverter<LicenseStatus, Byte> {

    @Override
    public Byte convertToDatabaseColumn(LicenseStatus attribute) {
        return attribute != null ? (byte) attribute.getId() : null;
    }

    @Override
    public LicenseStatus convertToEntityAttribute(Byte dbData) {
        return LicenseStatus.fromId(dbData != null ? dbData.intValue() : null);
    }
}
