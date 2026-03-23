package com.carrentalsystem.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VnpayCreatePaymentRequest {

    private Long invoiceId;
    private Long bookingId;
    private String bookingCode;
}
