package com.carrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a vehicle category (model catalog).
 * One row = one brand + line + variant combination.
 */
@Entity
@Table(name = "vehicle_categories", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "brand", "name", "model" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleCategoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String brand;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 120)
    private String model;

    @Column
    private Integer seats;

    @Column(name = "battery_capacity_kwh", precision = 6, scale = 2)
    private BigDecimal batteryCapacityKwh;

    @Column(name = "range_km")
    private Integer rangeKm;

    @Column(name = "charging_time_hours", precision = 5, scale = 2)
    private BigDecimal chargingTimeHours;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "vehicleCategory", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<VehicleCategoryImageEntity> images = new ArrayList<>();

    @OneToMany(mappedBy = "vehicleCategory", fetch = FetchType.LAZY)
    @Builder.Default
    private List<VehicleEntity> vehicles = new ArrayList<>();

    @OneToMany(mappedBy = "vehicleCategory", fetch = FetchType.LAZY)
    @Builder.Default
    private List<PricingEntity> pricings = new ArrayList<>();
}
