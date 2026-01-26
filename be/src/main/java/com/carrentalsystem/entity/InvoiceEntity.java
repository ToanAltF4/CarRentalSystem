package com.carrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity representing an invoice with fee breakdown.
 */
@Entity
@Table(name = "invoices", indexes = {
        @Index(name = "idx_invoice_booking", columnList = "booking_id"),
        @Index(name = "idx_invoice_number", columnList = "invoice_number"),
        @Index(name = "idx_invoice_payment_status", columnList = "payment_status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_number", nullable = false, unique = true, length = 30)
    private String invoiceNumber;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private BookingEntity booking;

    @Transient
    private InspectionEntity inspection;

    // Fee breakdown
    @Column(name = "rental_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal rentalFee;

    @Column(name = "driver_fee", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal driverFee = BigDecimal.ZERO;

    @Transient
    @Builder.Default
    private Integer overtimeHours = 0;

    @Transient
    @Builder.Default
    private BigDecimal overtimeFee = BigDecimal.ZERO;

    @Column(name = "damage_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal damageFee = BigDecimal.ZERO;

    @Column(name = "delivery_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal deliveryFee = BigDecimal.ZERO;

    @Transient
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Transient
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    // Totals
    @Transient
    private BigDecimal subtotal;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    // Payment info
    @Convert(converter = com.carrentalsystem.entity.converter.PaymentStatusConverter.class)
    @Column(name = "payment_status", length = 30)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Transient
    private String paymentMethod;

    @Transient
    private LocalDateTime paidAt;

    // Dates
    @Transient
    private LocalDateTime actualReturnDate;

    @Transient
    @Builder.Default
    private LocalDateTime issuedAt = LocalDateTime.now();

    @Transient
    private LocalDate dueDate;

    @Transient
    private String notes;

    @Transient
    private LocalDateTime createdAt;

    @Transient
    private LocalDateTime updatedAt;
}
