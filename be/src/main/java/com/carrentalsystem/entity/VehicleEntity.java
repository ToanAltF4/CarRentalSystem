package com.carrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * JPA Entity representing an Electric Vehicle in the rental fleet.
 */
@Entity
@Table(name = "vehicles", indexes = {
        @Index(name = "idx_vehicles_status", columnList = "status_id"),
        @Index(name = "idx_vehicles_brand", columnList = "brand"),
        @Index(name = "idx_vehicles_name_model", columnList = "name, model")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(nullable = false, length = 50)
    private String brand;

    @Column(name = "license_plate", nullable = false, unique = true, length = 20)
    private String licensePlate;

    @Column(name = "battery_capacity_kwh", precision = 5, scale = 2)
    private BigDecimal batteryCapacityKwh;

    @Column(name = "range_km")
    private Integer rangeKm;

    @Column(name = "charging_time_hours", precision = 4, scale = 2)
    private BigDecimal chargingTimeHours;

    @Column(name = "daily_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal dailyRate;

    @Convert(converter = com.carrentalsystem.entity.converter.VehicleStatusConverter.class)
    @Column(name = "status_id")
    @Builder.Default
    private VehicleStatus status = VehicleStatus.AVAILABLE;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "seats")
    @Builder.Default
    private Integer seats = 5;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private VehicleCategoryEntity category;

    @Transient
    private LocalDateTime createdAt;

    @Transient
    private LocalDateTime updatedAt;
}
