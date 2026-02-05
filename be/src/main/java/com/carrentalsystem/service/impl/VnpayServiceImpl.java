package com.carrentalsystem.service.impl;

import com.carrentalsystem.dto.payment.VnpayCreatePaymentRequest;
import com.carrentalsystem.dto.payment.VnpayCreatePaymentResponse;
import com.carrentalsystem.dto.payment.VnpayReturnResponse;
import com.carrentalsystem.entity.BookingEntity;
import com.carrentalsystem.entity.BookingStatus;
import com.carrentalsystem.entity.InvoiceEntity;
import com.carrentalsystem.entity.PaymentStatus;
import com.carrentalsystem.exception.ResourceNotFoundException;
import com.carrentalsystem.repository.BookingRepository;
import com.carrentalsystem.repository.InvoiceRepository;
import com.carrentalsystem.service.VnpayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VnpayServiceImpl implements VnpayService {

    private final BookingRepository bookingRepository;
    private final InvoiceRepository invoiceRepository;

    @Value("${app.vnpay.tmn-code}")
    private String tmnCode;

    @Value("${app.vnpay.hash-secret}")
    private String hashSecret;

    @Value("${app.vnpay.url}")
    private String vnpUrl;

    @Value("${app.vnpay.return-url}")
    private String returnUrl;

    @Value("${app.vnpay.version:2.1.0}")
    private String version;

    @Value("${app.vnpay.command:pay}")
    private String command;

    @Value("${app.vnpay.curr-code:VND}")
    private String currencyCode;

    @Value("${app.vnpay.locale:vn}")
    private String locale;

    @Override
    @Transactional(readOnly = true)
    public VnpayCreatePaymentResponse createPaymentUrl(VnpayCreatePaymentRequest request,
            HttpServletRequest servletRequest) {
        if (request.getInvoiceId() == null && request.getBookingId() == null
                && (request.getBookingCode() == null || request.getBookingCode().isBlank())) {
            throw new IllegalArgumentException("invoiceId, bookingId, or bookingCode is required");
        }

        String txnRef;
        BigDecimal amount;

        if (request.getInvoiceId() != null) {
            InvoiceEntity invoice = invoiceRepository.findById(request.getInvoiceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", request.getInvoiceId()));
            amount = invoice.getTotalAmount();
            txnRef = invoice.getInvoiceNumber();
        } else if (request.getBookingId() != null) {
            BookingEntity booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", request.getBookingId()));
            amount = booking.getTotalAmount();
            txnRef = booking.getBookingCode();
        } else {
            BookingEntity booking = bookingRepository.findByBookingCode(request.getBookingCode())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Booking", "bookingCode", request.getBookingCode()));
            amount = booking.getTotalAmount();
            txnRef = booking.getBookingCode();
        }

        if (amount == null) {
            throw new IllegalArgumentException("Total amount is required");
        }
        if (txnRef == null || txnRef.isBlank()) {
            throw new IllegalArgumentException("Transaction reference is required");
        }

        String ipAddress = getClientIp(servletRequest);
        String createDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", version);
        params.put("vnp_Command", command);
        params.put("vnp_TmnCode", tmnCode);
        params.put("vnp_Amount", amount.multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .toPlainString());
        params.put("vnp_CurrCode", currencyCode);
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", "Payment for " + txnRef);
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", locale);
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_IpAddr", ipAddress);
        params.put("vnp_CreateDate", createDate);
        params.put("vnp_SecureHashType", "HmacSHA512");

        String query = buildQuery(params);
        String hashData = buildHashData(params);
        String secureHash = hmacSHA512(hashSecret, hashData);
        String paymentUrl = vnpUrl + "?" + query + "&vnp_SecureHash=" + secureHash;

        return VnpayCreatePaymentResponse.builder()
                .paymentUrl(paymentUrl)
                .build();
    }

    @Override
    @Transactional
    public VnpayReturnResponse handleReturn(Map<String, String> params) {
        String secureHash = params.get("vnp_SecureHash");
        if (secureHash == null) {
            return VnpayReturnResponse.builder()
                    .code("99")
                    .message("Missing secure hash")
                    .build();
        }

        Map<String, String> filtered = params.entrySet().stream()
                .filter(e -> e.getKey().startsWith("vnp_"))
                .filter(e -> !"vnp_SecureHash".equals(e.getKey()))
                .filter(e -> !"vnp_SecureHashType".equals(e.getKey()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        String hashData = buildHashData(filtered);
        String calculated = hmacSHA512(hashSecret, hashData);
        if (!calculated.equalsIgnoreCase(secureHash)) {
            return VnpayReturnResponse.builder()
                    .code("97")
                    .message("Invalid signature")
                    .build();
        }

        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        if (txnRef == null || responseCode == null) {
            return VnpayReturnResponse.builder()
                    .code("99")
                    .message("Missing required params")
                    .build();
        }

        InvoiceEntity invoice = invoiceRepository.findByInvoiceNumber(txnRef).orElse(null);
        BookingEntity booking = invoice == null ? bookingRepository.findByBookingCode(txnRef).orElse(null) : null;

        if (invoice == null && booking == null) {
            throw new ResourceNotFoundException("Transaction", "txnRef", txnRef);
        }

        if ("00".equals(responseCode)) {
            if (invoice != null) {
                invoice.setPaymentStatus(PaymentStatus.PAID);
                invoice.setPaidAt(LocalDateTime.now());
                invoice.setPaymentMethod("VNPAY");
                invoiceRepository.save(invoice);
            } else if (booking != null) {
                // Determine fees - default to 0 if null
                BigDecimal rentalFee = booking.getRentalFee() != null ? booking.getRentalFee() : BigDecimal.ZERO;
                BigDecimal driverFee = booking.getDriverFee() != null ? booking.getDriverFee() : BigDecimal.ZERO;
                BigDecimal deliveryFee = booking.getDeliveryFee() != null ? booking.getDeliveryFee() : BigDecimal.ZERO;

                // Create new PAID invoice for this booking
                InvoiceEntity newInvoice = InvoiceEntity.builder()
                        .booking(booking)
                        .invoiceNumber(txnRef) // Using booking code/txnRef as invoice number
                        .rentalFee(rentalFee)
                        .driverFee(driverFee)
                        .deliveryFee(deliveryFee)
                        .totalAmount(booking.getTotalAmount() != null ? booking.getTotalAmount() : BigDecimal.ZERO)
                        .paymentStatus(PaymentStatus.PAID)
                        .issuedAt(LocalDateTime.now())
                        .createdAt(LocalDateTime.now())
                        .build();

                // Manually set transient fields if needed or handle via proper DB columns
                // Note: paidAt and paymentMethod are transient in InvoiceEntity, so they won't
                // be saved directly
                // unless we add columns or a separate Transaction entity.
                // For now, we rely on paymentStatus=PAID.

                invoiceRepository.save(newInvoice);

                // Auto-confirm after payment
                booking.setStatus(BookingStatus.CONFIRMED);
                bookingRepository.save(booking);
            }
            return VnpayReturnResponse.builder()
                    .code("00")
                    .message("Payment success")
                    .invoiceNumber(txnRef)
                    .paymentStatus(PaymentStatus.PAID.name())
                    .build();
        }

        return VnpayReturnResponse.builder()
                .code(responseCode)
                .message("Payment failed")
                .invoiceNumber(txnRef)
                .paymentStatus(invoice != null ? invoice.getPaymentStatus().name() : booking.getStatus().name())
                .build();
    }

    private String buildQuery(Map<String, String> params) {
        return params.entrySet().stream()
                .sorted(Comparator.comparing(Map.Entry::getKey))
                .map(e -> encodeVnp(e.getKey()) + "=" + encodeVnp(e.getValue()))
                .collect(Collectors.joining("&"));
    }

    private String buildHashData(Map<String, String> params) {
        return params.entrySet().stream()
                .filter(e -> !"vnp_SecureHashType".equals(e.getKey()))
                .sorted(Comparator.comparing(Map.Entry::getKey))
                .map(e -> encodeVnp(e.getKey()) + "=" + encodeVnp(e.getValue()))
                .collect(Collectors.joining("&"));
    }

    private String encodeVnp(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec keySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac.init(keySpec);
            byte[] bytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(bytes.length * 2);
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to generate HMAC", ex);
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
