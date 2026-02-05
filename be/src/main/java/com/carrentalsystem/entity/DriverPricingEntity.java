package com.carrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Entity representing driver pricing configuration.
 * Used to calculate driver fee for WITH_DRIVER rental type.
 * Now linked to vehicle_category for category-specific pricing.
 */
@Entity
@Table(name = "driver_pricing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverPricingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_category_id")
    private VehicleCategoryEntity vehicleCategory;

    @Column(name = "daily_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal dailyFee;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
}
