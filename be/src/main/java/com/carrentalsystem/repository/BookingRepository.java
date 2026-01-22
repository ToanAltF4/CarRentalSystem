package com.carrentalsystem.repository;

import com.carrentalsystem.entity.BookingEntity;
import com.carrentalsystem.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Booking operations with overlap detection.
 */
@Repository
public interface BookingRepository extends JpaRepository<BookingEntity, Long> {

    /**
     * Find booking by booking code.
     */
    Optional<BookingEntity> findByBookingCode(String bookingCode);

    /**
     * Check if there are overlapping bookings for a vehicle.
     * Two date ranges overlap if: start1 <= end2 AND start2 <= end1
     * Only considers active bookings (not CANCELLED or COMPLETED).
     */
    @Query("SELECT COUNT(b) > 0 FROM BookingEntity b WHERE b.vehicle.id = :vehicleId " +
            "AND b.status NOT IN ('CANCELLED', 'COMPLETED') " +
            "AND b.startDate <= :endDate " +
            "AND b.endDate >= :startDate")
    boolean hasOverlappingBookings(
            @Param("vehicleId") Long vehicleId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Find all overlapping bookings for a vehicle (for detailed error info).
     */
    @Query("SELECT b FROM BookingEntity b WHERE b.vehicle.id = :vehicleId " +
            "AND b.status NOT IN ('CANCELLED', 'COMPLETED') " +
            "AND b.startDate <= :endDate " +
            "AND b.endDate >= :startDate")
    List<BookingEntity> findOverlappingBookings(
            @Param("vehicleId") Long vehicleId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Find bookings by vehicle ID.
     */
    List<BookingEntity> findByVehicleIdOrderByStartDateDesc(Long vehicleId);

    /**
     * Find bookings by status.
     */
    List<BookingEntity> findByStatusOrderByCreatedAtDesc(BookingStatus status);

    /**
     * Find bookings by customer email.
     */
    List<BookingEntity> findByCustomerEmailOrderByCreatedAtDesc(String customerEmail);

    /**
     * Find upcoming bookings (start date >= today, not cancelled).
     */
    @Query("SELECT b FROM BookingEntity b WHERE b.startDate >= :today " +
            "AND b.status != 'CANCELLED' " +
            "ORDER BY b.startDate ASC")
    List<BookingEntity> findUpcomingBookings(@Param("today") LocalDate today);

    /**
     * Count active bookings for a vehicle.
     */
    @Query("SELECT COUNT(b) FROM BookingEntity b WHERE b.vehicle.id = :vehicleId " +
            "AND b.status NOT IN ('CANCELLED', 'COMPLETED')")
    long countActiveBookingsByVehicle(@Param("vehicleId") Long vehicleId);
}
