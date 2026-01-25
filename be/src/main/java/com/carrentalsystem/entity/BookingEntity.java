package com.carrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity representing a vehicle booking/rental.
 */
@Entity
@Table(name = "bookings", indexes = {
        @Index(name = "idx_booking_vehicle", columnList = "vehicle_id"),
        @Index(name = "idx_booking_dates", columnList = "start_date, end_date"),
        @Index(name = "idx_booking_status", columnList = "status_id"),
        @Index(name = "idx_booking_code", columnList = "booking_code")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_code", nullable = false, unique = true, length = 20)
    private String bookingCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private VehicleEntity vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Column(name = "rental_type_id")
    private Integer rentalTypeId;

    @Column(name = "pickup_method_id")
    private Integer pickupMethodId;

    @Column(name = "driver_id")
    private Long driverId;

    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;

    @Column(name = "customer_email", nullable = false, length = 100)
    private String customerEmail;

    @Transient
    private String customerPhone;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "daily_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal dailyRate;

    @Column(name = "rental_fee", precision = 12, scale = 2)
    private BigDecimal rentalFee;

    @Column(name = "driver_fee", precision = 12, scale = 2)
    private BigDecimal driverFee;

    @Column(name = "delivery_fee", precision = 12, scale = 2)
    private BigDecimal deliveryFee;

    @Column(name = "total_amount", precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Convert(converter = com.carrentalsystem.entity.converter.BookingStatusConverter.class)
    @Column(name = "status_id")
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @Transient
    private String notes;

    @Transient
    private Integer totalDays;

    @Transient
    private LocalDateTime createdAt;

    @Transient
    private LocalDateTime updatedAt;
}
