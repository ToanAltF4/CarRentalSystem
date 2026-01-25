package com.carrentalsystem.entity.converter;

import com.carrentalsystem.entity.LicenseStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class LicenseStatusConverter implements AttributeConverter<LicenseStatus, Integer> {

    @Override
    public Integer convertToDatabaseColumn(LicenseStatus attribute) {
        return attribute != null ? attribute.getId() : null;
    }

    @Override
    public LicenseStatus convertToEntityAttribute(Integer dbData) {
        return LicenseStatus.fromId(dbData);
    }
}
