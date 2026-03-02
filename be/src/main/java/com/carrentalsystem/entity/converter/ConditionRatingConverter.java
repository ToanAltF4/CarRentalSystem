package com.carrentalsystem.entity.converter;

import com.carrentalsystem.entity.ConditionRating;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class ConditionRatingConverter implements AttributeConverter<ConditionRating, String> {

    @Override
    public String convertToDatabaseColumn(ConditionRating attribute) {
        return attribute != null ? attribute.name() : null;
    }

    @Override
    public ConditionRating convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        String normalized = dbData.trim();
        if (normalized.isEmpty()) {
            return null;
        }
        try {
            if (normalized.chars().allMatch(Character::isDigit)) {
                return ConditionRating.fromId(Integer.parseInt(normalized));
            }
            return ConditionRating.valueOf(normalized.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
