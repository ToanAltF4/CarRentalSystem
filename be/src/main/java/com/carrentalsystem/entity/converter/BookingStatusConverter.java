package com.carrentalsystem.entity.converter;

import com.carrentalsystem.entity.BookingStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class BookingStatusConverter implements AttributeConverter<BookingStatus, Integer> {

    @Override
    public Integer convertToDatabaseColumn(BookingStatus attribute) {
        return attribute != null ? attribute.getId() : null;
    }

    @Override
    public BookingStatus convertToEntityAttribute(Integer dbData) {
        return BookingStatus.fromId(dbData);
    }
}
