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
        @Index(name = "idx_pricing_vehicle_category", columnList = "vehicle_category_id"),
        @Index(name = "idx_pricing_effective", columnList = "vehicle_category_id, effective_from, effective_to, is_active")
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

    @Column(name = "overtime_fee_per_hour", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal overtimeFeePerHour = BigDecimal.valueOf(50000);

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
