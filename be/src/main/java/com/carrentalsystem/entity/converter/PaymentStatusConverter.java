package com.carrentalsystem.entity.converter;

import com.carrentalsystem.entity.PaymentStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class PaymentStatusConverter implements AttributeConverter<PaymentStatus, Integer> {

    @Override
    public Integer convertToDatabaseColumn(PaymentStatus attribute) {
        return attribute != null ? attribute.getId() : null;
    }

    @Override
    public PaymentStatus convertToEntityAttribute(Integer dbData) {
        return PaymentStatus.fromId(dbData);
    }
}
