package com.carrentalsystem.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VnpayReturnResponse {
    private String code;
    private String message;
    private String invoiceNumber;
    private String paymentStatus;
}
