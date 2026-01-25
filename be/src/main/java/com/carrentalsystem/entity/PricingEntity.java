package com.carrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity representing pricing for a vehicle category.
 */
@Entity
@Table(name = "pricing", indexes = {
        @Index(name = "idx_pricing_category", columnList = "vehicle_category_id"),
        @Index(name = "idx_pricing_active", columnList = "is_active, effective_from, effective_to")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_category_id", nullable = false)
    private VehicleCategoryEntity vehicleCategory;

    @Column(name = "daily_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal dailyPrice;

    @Column(name = "weekly_price", precision = 10, scale = 2)
    private BigDecimal weeklyPrice;

    @Column(name = "monthly_price", precision = 10, scale = 2)
    private BigDecimal monthlyPrice;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "overtime_fee_per_hour", precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal overtimeFeePerHour = BigDecimal.valueOf(10.00);

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Transient
    private LocalDateTime createdAt;

    @Transient
    private LocalDateTime updatedAt;
}
