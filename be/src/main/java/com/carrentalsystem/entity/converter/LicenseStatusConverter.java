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
        if (dbData == null) {
            return null;
        }
        String normalized = dbData.trim();
        if (normalized.isEmpty() || "NONE".equalsIgnoreCase(normalized)) {
            return null;
        }
        try {
            if (normalized.chars().allMatch(Character::isDigit)) {
                return LicenseStatus.fromId(Integer.parseInt(normalized));
            }
            return LicenseStatus.valueOf(normalized.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
