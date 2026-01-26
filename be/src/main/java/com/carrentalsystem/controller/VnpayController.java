package com.carrentalsystem.controller;

import com.carrentalsystem.dto.payment.VnpayCreatePaymentRequest;
import com.carrentalsystem.dto.payment.VnpayCreatePaymentResponse;
import com.carrentalsystem.dto.payment.VnpayReturnResponse;
import com.carrentalsystem.service.VnpayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import java.util.Map;

@RestController
@RequestMapping("/api/payments/vnpay")
@RequiredArgsConstructor
public class VnpayController {

    private final VnpayService vnpayService;

    @Value("${app.vnpay.return-frontend}")
    private String returnFrontendUrl;

    @PostMapping("/create")
    public ResponseEntity<VnpayCreatePaymentResponse> createPayment(
            @RequestBody(required = false) VnpayCreatePaymentRequest request,
            HttpServletRequest servletRequest) {
        VnpayCreatePaymentRequest payload = request != null ? request : new VnpayCreatePaymentRequest();
        return ResponseEntity.ok(vnpayService.createPaymentUrl(payload, servletRequest));
    }

    @GetMapping("/return")
    public void handleReturn(@RequestParam Map<String, String> params, HttpServletResponse response) {
        VnpayReturnResponse result = vnpayService.handleReturn(params);
        String redirectUrl = returnFrontendUrl
                + "?code=" + encode(result.getCode())
                + "&message=" + encode(result.getMessage())
                + "&invoiceNumber=" + encode(result.getInvoiceNumber())
                + "&paymentStatus=" + encode(result.getPaymentStatus());
        try {
            response.sendRedirect(redirectUrl);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to redirect to frontend", ex);
        }
    }

    private String encode(String value) {
        if (value == null) {
            return "";
        }
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
