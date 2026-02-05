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
                        "AND b.status NOT IN (:cancelled, :completed) " +
                        "AND b.startDate <= :endDate " +
                        "AND b.endDate >= :startDate")
        boolean hasOverlappingBookings(
                        @Param("vehicleId") Long vehicleId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate,
                        @Param("cancelled") BookingStatus cancelled,
                        @Param("completed") BookingStatus completed);

        /**
         * Find all overlapping bookings for a vehicle (for detailed error info).
         */
        @Query("SELECT b FROM BookingEntity b WHERE b.vehicle.id = :vehicleId " +
                        "AND b.status NOT IN (:cancelled, :completed) " +
                        "AND b.startDate <= :endDate " +
                        "AND b.endDate >= :startDate")
        List<BookingEntity> findOverlappingBookings(
                        @Param("vehicleId") Long vehicleId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate,
                        @Param("cancelled") BookingStatus cancelled,
                        @Param("completed") BookingStatus completed);

        /**
         * Find bookings by vehicle ID.
         */
        List<BookingEntity> findByVehicleIdOrderByStartDateDesc(Long vehicleId);

        /**
         * Find bookings by status.
         */
        List<BookingEntity> findByStatusOrderByStartDateDesc(BookingStatus status);

        /**
         * Find bookings by customer email.
         */
        List<BookingEntity> findByCustomerEmailOrderByStartDateDesc(String customerEmail);

        /**
         * Find upcoming bookings (start date >= today, not cancelled).
         */
        @Query("SELECT b FROM BookingEntity b WHERE b.startDate >= :today " +
                        "AND b.status != :cancelled " +
                        "ORDER BY b.startDate ASC")
        List<BookingEntity> findUpcomingBookings(@Param("today") LocalDate today,
                        @Param("cancelled") BookingStatus cancelled);

        /**
         * Count active bookings for a vehicle.
         */
        @Query("SELECT COUNT(b) FROM BookingEntity b WHERE b.vehicle.id = :vehicleId " +
                        "AND b.status NOT IN (:cancelled, :completed)")
        long countActiveBookingsByVehicle(@Param("vehicleId") Long vehicleId,
                        @Param("cancelled") BookingStatus cancelled,
                        @Param("completed") BookingStatus completed);

        /**
         * Find bookings by status (for operator).
         */
        List<BookingEntity> findByStatus(BookingStatus status);

        /**
         * Find bookings by start date (for operator - today's bookings).
         */
        List<BookingEntity> findByStartDate(LocalDate startDate);

        /**
         * Count bookings by status.
         */
        long countByStatus(BookingStatus status);

        List<BookingEntity> findByAssignedStaffId(Long staffId);

        List<BookingEntity> findByDriverId(Long driverId);

        List<BookingEntity> findByDriverIdAndStatus(Long driverId, BookingStatus status);

        @Query("SELECT COUNT(b) FROM BookingEntity b WHERE (b.assignedStaffId = :staffId OR b.driverId = :staffId) AND b.status IN :statuses")
        int countActiveBookingsByStaff(@Param("staffId") Long staffId, @Param("statuses") List<BookingStatus> statuses);

        @Query("SELECT b FROM BookingEntity b " +
                        "LEFT JOIN FETCH b.vehicle " +
                        "LEFT JOIN FETCH b.rentalType " +
                        "LEFT JOIN FETCH b.pickupMethod " +
                        "ORDER BY b.startDate DESC")
        List<BookingEntity> findRecentBookingsWithVehicle(org.springframework.data.domain.Pageable pageable);

        @Query("SELECT b FROM BookingEntity b " +
                        "LEFT JOIN FETCH b.vehicle " +
                        "LEFT JOIN FETCH b.rentalType " +
                        "LEFT JOIN FETCH b.pickupMethod " +
                        "ORDER BY b.createdAt DESC")
        List<BookingEntity> findAllWithVehicle();

        @Query("SELECT b FROM BookingEntity b WHERE b.startDate <= :date AND b.endDate >= :date AND b.status IN :statuses")
        List<BookingEntity> findActiveBookingsOnDate(@Param("date") LocalDate date,
                        @Param("statuses") List<BookingStatus> statuses);

        @Query("SELECT MONTH(b.startDate) as month, SUM(b.totalAmount) as revenue, COUNT(b) as count " +
                        "FROM BookingEntity b " +
                        "WHERE YEAR(b.startDate) = :year AND b.status != :cancelled " +
                        "GROUP BY MONTH(b.startDate) ORDER BY MONTH(b.startDate)")
        List<Object[]> findMonthlyRevenueByYear(@Param("year") int year, @Param("cancelled") BookingStatus cancelled);
}
