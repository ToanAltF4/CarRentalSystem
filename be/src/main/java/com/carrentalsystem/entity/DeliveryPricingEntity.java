package com.carrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Entity representing delivery pricing configuration.
 * Used to calculate delivery fee for DELIVERY pickup method.
 */
@Entity
@Table(name = "delivery_pricing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryPricingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "base_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal baseFee;

    @Column(name = "per_km_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal perKmFee = new BigDecimal("10000.00");

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
}
