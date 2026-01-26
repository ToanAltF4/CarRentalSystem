package com.carrentalsystem.entity.converter;

import com.carrentalsystem.entity.PaymentStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class PaymentStatusConverter implements AttributeConverter<PaymentStatus, String> {

    @Override
    public String convertToDatabaseColumn(PaymentStatus attribute) {
        return attribute != null ? attribute.name() : null;
    }

    @Override
    public PaymentStatus convertToEntityAttribute(String dbData) {
        return dbData != null ? PaymentStatus.valueOf(dbData) : null;
    }
}
