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
        return dbData != null ? ConditionRating.valueOf(dbData) : null;
    }
}
