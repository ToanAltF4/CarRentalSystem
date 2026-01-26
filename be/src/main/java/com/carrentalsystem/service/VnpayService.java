package com.carrentalsystem.service;

import com.carrentalsystem.dto.payment.VnpayCreatePaymentRequest;
import com.carrentalsystem.dto.payment.VnpayCreatePaymentResponse;
import com.carrentalsystem.dto.payment.VnpayReturnResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

public interface VnpayService {

    VnpayCreatePaymentResponse createPaymentUrl(VnpayCreatePaymentRequest request, HttpServletRequest servletRequest);

    VnpayReturnResponse handleReturn(Map<String, String> params);
}
