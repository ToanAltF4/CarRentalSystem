package com.carrentalsystem.entity.converter;

import com.carrentalsystem.entity.ConditionRating;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class ConditionRatingConverter implements AttributeConverter<ConditionRating, Byte> {

    @Override
    public Byte convertToDatabaseColumn(ConditionRating attribute) {
        return attribute != null ? (byte) attribute.getId() : null;
    }

    @Override
    public ConditionRating convertToEntityAttribute(Byte dbData) {
        return ConditionRating.fromId(dbData != null ? dbData.intValue() : null);
    }
}
