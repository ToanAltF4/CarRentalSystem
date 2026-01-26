package com.carrentalsystem.entity.converter;

import com.carrentalsystem.entity.BookingStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class BookingStatusConverter implements AttributeConverter<BookingStatus, Byte> {

    @Override
    public Byte convertToDatabaseColumn(BookingStatus attribute) {
        return attribute != null ? (byte) attribute.getId() : null;
    }

    @Override
    public BookingStatus convertToEntityAttribute(Byte dbData) {
        return BookingStatus.fromId(dbData != null ? dbData.intValue() : null);
    }
}
