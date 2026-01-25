package com.carrentalsystem.entity.converter;

import com.carrentalsystem.entity.ConditionRating;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class ConditionRatingConverter implements AttributeConverter<ConditionRating, Integer> {

    @Override
    public Integer convertToDatabaseColumn(ConditionRating attribute) {
        return attribute != null ? attribute.getId() : null;
    }

    @Override
    public ConditionRating convertToEntityAttribute(Integer dbData) {
        return ConditionRating.fromId(dbData);
    }
}
