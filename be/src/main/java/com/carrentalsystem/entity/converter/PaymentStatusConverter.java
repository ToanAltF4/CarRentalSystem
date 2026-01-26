package com.carrentalsystem.entity.converter;

import com.carrentalsystem.entity.PaymentStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class PaymentStatusConverter implements AttributeConverter<PaymentStatus, Byte> {

    @Override
    public Byte convertToDatabaseColumn(PaymentStatus attribute) {
        return attribute != null ? (byte) attribute.getId() : null;
    }

    @Override
    public PaymentStatus convertToEntityAttribute(Byte dbData) {
        return PaymentStatus.fromId(dbData != null ? dbData.intValue() : null);
    }
}
