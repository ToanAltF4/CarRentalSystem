package com.carrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * JPA Entity representing a physical vehicle (car) in the rental fleet.
 * Model/spec information is in VehicleCategoryEntity.
 */
@Entity
@Table(name = "vehicles", indexes = {
        @Index(name = "idx_vehicles_vehicle_category", columnList = "vehicle_category_id"),
        @Index(name = "idx_vehicles_status", columnList = "status")
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_category_id", nullable = false)
    private VehicleCategoryEntity vehicleCategory;

    @Column(name = "license_plate", nullable = false, unique = true, length = 20)
    private String licensePlate;

    @Convert(converter = com.carrentalsystem.entity.converter.VehicleStatusConverter.class)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private VehicleStatus status = VehicleStatus.AVAILABLE;

    @Column(name = "vin", unique = true, length = 50)
    private String vin;

    @Column(name = "odometer")
    private Integer odometer;

    @Column(name = "current_battery_percent")
    private Integer currentBatteryPercent;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
