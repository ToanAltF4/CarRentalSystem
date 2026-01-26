package com.carrentalsystem.entity.converter;

import com.carrentalsystem.entity.BookingStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class BookingStatusConverter implements AttributeConverter<BookingStatus, String> {

    @Override
    public String convertToDatabaseColumn(BookingStatus attribute) {
        return attribute != null ? attribute.name() : null;
    }

    @Override
    public BookingStatus convertToEntityAttribute(String dbData) {
        return dbData != null ? BookingStatus.valueOf(dbData) : null;
    }
}
