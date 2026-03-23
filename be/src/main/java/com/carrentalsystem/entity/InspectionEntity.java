package com.carrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entity representing a vehicle inspection (Check-in/Check-out).
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false) // Removed unique=true
    private BookingEntity booking;

    @Enumerated(EnumType.STRING)
    @Column(name = "inspection_type", length = 20, nullable = false)
    private InspectionType type; // PICKUP, RETURN

    // Vehicle condition
    @Column(name = "battery_level", nullable = false)
    private Integer batteryLevel;

    @Column(nullable = false)
    private Integer odometer;

    @Column(name = "charging_cable_present")
    @Builder.Default
    private Boolean chargingCablePresent = true;

    @Convert(converter = com.carrentalsystem.entity.converter.ConditionRatingConverter.class)
    @Column(name = "exterior_condition", length = 30)
    @Builder.Default
    private ConditionRating exteriorCondition = ConditionRating.GOOD;

    @Convert(converter = com.carrentalsystem.entity.converter.ConditionRatingConverter.class)
    @Column(name = "interior_condition", length = 30)
    @Builder.Default
    private ConditionRating interiorCondition = ConditionRating.GOOD;

    // Damage details
    @Column(name = "has_damage")
    @Builder.Default
    private Boolean hasDamage = false;

    @Column(name = "damage_description", columnDefinition = "TEXT")
    private String damageDescription;

    @Column(name = "damage_photos", columnDefinition = "TEXT")
    private String damagePhotos; // Comma separated URLs

    // Inspector info
    @Column(name = "inspected_by")
    private Long inspectedById; // Staff ID

    @Column(name = "inspection_notes", columnDefinition = "TEXT")
    private String inspectionNotes;

    @Column(name = "inspected_at")
    @Builder.Default
    private LocalDateTime inspectedAt = LocalDateTime.now();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (inspectedAt == null)
            inspectedAt = LocalDateTime.now();
    }
}
