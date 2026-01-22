package com.carrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity representing a vehicle inspection at return.
 */
@Entity
@Table(name = "inspections", indexes = {
        @Index(name = "idx_inspection_booking", columnList = "booking_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InspectionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private BookingEntity booking;

    // Vehicle condition
    @Column(name = "battery_level", nullable = false)
    private Integer batteryLevel;

    @Column(nullable = false)
    private Integer odometer;

    @Column(name = "charging_cable_present")
    @Builder.Default
    private Boolean chargingCablePresent = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "exterior_condition")
    @Builder.Default
    private ConditionRating exteriorCondition = ConditionRating.GOOD;

    @Enumerated(EnumType.STRING)
    @Column(name = "interior_condition")
    @Builder.Default
    private ConditionRating interiorCondition = ConditionRating.GOOD;

    // Damage details
    @Column(name = "has_damage")
    @Builder.Default
    private Boolean hasDamage = false;

    @Column(name = "damage_description", columnDefinition = "TEXT")
    private String damageDescription;

    @Column(name = "damage_photos", columnDefinition = "TEXT")
    private String damagePhotos;

    // Inspector info
    @Column(name = "inspected_by", length = 100)
    private String inspectedBy;

    @Column(name = "inspection_notes", columnDefinition = "TEXT")
    private String inspectionNotes;

    @Column(name = "inspected_at")
    @Builder.Default
    private LocalDateTime inspectedAt = LocalDateTime.now();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
