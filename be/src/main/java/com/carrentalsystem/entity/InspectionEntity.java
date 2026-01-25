package com.carrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;
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

    @Transient
    @Builder.Default
    private Boolean chargingCablePresent = true;

    @Convert(converter = com.carrentalsystem.entity.converter.ConditionRatingConverter.class)
    @Column(name = "exterior_condition_id")
    @Builder.Default
    private ConditionRating exteriorCondition = ConditionRating.GOOD;

    @Convert(converter = com.carrentalsystem.entity.converter.ConditionRatingConverter.class)
    @Column(name = "interior_condition_id")
    @Builder.Default
    private ConditionRating interiorCondition = ConditionRating.GOOD;

    // Damage details
    @Column(name = "has_damage")
    @Builder.Default
    private Boolean hasDamage = false;

    @Transient
    private String damageDescription;

    @Transient
    private String damagePhotos;

    // Inspector info
    @Transient
    private String inspectedBy;

    @Transient
    private String inspectionNotes;

    @Transient
    @Builder.Default
    private LocalDateTime inspectedAt = LocalDateTime.now();

    @Transient
    private LocalDateTime createdAt;
}
