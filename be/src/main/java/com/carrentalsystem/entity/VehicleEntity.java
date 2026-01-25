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

    @Transient
    private BigDecimal batteryCapacityKwh;

    @Transient
    private Integer rangeKm;

    @Transient
    private BigDecimal chargingTimeHours;

    @Column(name = "daily_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal dailyRate;

    @Convert(converter = com.carrentalsystem.entity.converter.VehicleStatusConverter.class)
    @Column(name = "status_id")
    @Builder.Default
    private VehicleStatus status = VehicleStatus.AVAILABLE;

    @Transient
    private String imageUrl;

    @Transient
    @Builder.Default
    private Integer seats = 5;

    @Transient
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private VehicleCategoryEntity category;

    @Transient
    private LocalDateTime createdAt;

    @Transient
    private LocalDateTime updatedAt;
}
