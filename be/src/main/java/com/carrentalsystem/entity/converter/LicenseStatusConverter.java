package com.carrentalsystem.entity.converter;

import com.carrentalsystem.entity.LicenseStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class LicenseStatusConverter implements AttributeConverter<LicenseStatus, String> {

    @Override
    public String convertToDatabaseColumn(LicenseStatus attribute) {
        return attribute != null ? attribute.name() : null;
    }

    @Override
    public LicenseStatus convertToEntityAttribute(String dbData) {
        return dbData != null ? LicenseStatus.valueOf(dbData) : null;
    }
}
