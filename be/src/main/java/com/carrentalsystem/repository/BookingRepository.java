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

        interface UserAssignmentCountProjection {
                Long getUserId();

                Long getCount();
        }

        interface UnavailableDateRangeProjection {
                LocalDate getStartDate();

                LocalDate getEndDate();

                String getStatus();
        }

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

        @Query("SELECT b FROM BookingEntity b " +
                        "LEFT JOIN FETCH b.vehicle v " +
                        "LEFT JOIN FETCH v.vehicleCategory " +
                        "LEFT JOIN FETCH b.rentalType " +
                        "LEFT JOIN FETCH b.pickupMethod " +
                        "WHERE v.id = :vehicleId ORDER BY b.startDate DESC")
        List<BookingEntity> findByVehicleIdOrderByStartDateDescWithDetails(@Param("vehicleId") Long vehicleId);

        /**
         * Find bookings by status.
         */
        List<BookingEntity> findByStatusOrderByStartDateDesc(BookingStatus status);

        @Query("SELECT b FROM BookingEntity b " +
                        "LEFT JOIN FETCH b.vehicle v " +
                        "LEFT JOIN FETCH v.vehicleCategory " +
                        "LEFT JOIN FETCH b.rentalType " +
                        "LEFT JOIN FETCH b.pickupMethod " +
                        "WHERE b.status = :status ORDER BY b.startDate DESC")
        List<BookingEntity> findByStatusOrderByStartDateDescWithDetails(@Param("status") BookingStatus status);

        /**
         * Find bookings by customer email.
         */
        List<BookingEntity> findByCustomerEmailOrderByStartDateDesc(String customerEmail);

        @Query("SELECT b FROM BookingEntity b " +
                        "LEFT JOIN FETCH b.vehicle v " +
                        "LEFT JOIN FETCH v.vehicleCategory " +
                        "LEFT JOIN FETCH b.rentalType " +
                        "LEFT JOIN FETCH b.pickupMethod " +
                        "WHERE b.customerEmail = :customerEmail ORDER BY b.startDate DESC")
        List<BookingEntity> findByCustomerEmailOrderByStartDateDescWithDetails(
                        @Param("customerEmail") String customerEmail);

        /**
         * Find upcoming bookings (start date >= today, not cancelled).
         */
        @Query("SELECT b FROM BookingEntity b WHERE b.startDate >= :today " +
                        "AND b.status != :cancelled " +
                        "ORDER BY b.startDate ASC")
        List<BookingEntity> findUpcomingBookings(@Param("today") LocalDate today,
                        @Param("cancelled") BookingStatus cancelled);

        @Query("SELECT b FROM BookingEntity b " +
                        "LEFT JOIN FETCH b.vehicle v " +
                        "LEFT JOIN FETCH v.vehicleCategory " +
                        "LEFT JOIN FETCH b.rentalType " +
                        "LEFT JOIN FETCH b.pickupMethod " +
                        "WHERE b.startDate >= :today AND b.status != :cancelled " +
                        "ORDER BY b.startDate ASC")
        List<BookingEntity> findUpcomingBookingsWithDetails(@Param("today") LocalDate today,
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

        @Query("SELECT b FROM BookingEntity b " +
                        "LEFT JOIN FETCH b.vehicle v " +
                        "LEFT JOIN FETCH v.vehicleCategory " +
                        "LEFT JOIN FETCH b.rentalType " +
                        "LEFT JOIN FETCH b.pickupMethod " +
                        "WHERE b.status = :status")
        List<BookingEntity> findByStatusWithDetails(@Param("status") BookingStatus status);

        /**
         * Find bookings by start date (for operator - today's bookings).
         */
        List<BookingEntity> findByStartDate(LocalDate startDate);

        /**
         * Count bookings by status.
         */
        long countByStatus(BookingStatus status);

        List<BookingEntity> findByAssignedStaffId(Long staffId);

        @Query("SELECT b FROM BookingEntity b " +
                        "LEFT JOIN FETCH b.vehicle v " +
                        "LEFT JOIN FETCH v.vehicleCategory " +
                        "LEFT JOIN FETCH b.rentalType " +
                        "LEFT JOIN FETCH b.pickupMethod " +
                        "WHERE b.assignedStaffId = :staffId")
        List<BookingEntity> findByAssignedStaffIdWithDetails(@Param("staffId") Long staffId);

        List<BookingEntity> findByDriverId(Long driverId);

        @Query("SELECT b FROM BookingEntity b " +
                        "LEFT JOIN FETCH b.vehicle v " +
                        "LEFT JOIN FETCH v.vehicleCategory " +
                        "LEFT JOIN FETCH b.rentalType " +
                        "LEFT JOIN FETCH b.pickupMethod " +
                        "WHERE b.driverId = :driverId")
        List<BookingEntity> findByDriverIdWithDetails(@Param("driverId") Long driverId);

        List<BookingEntity> findByDriverIdAndStatus(Long driverId, BookingStatus status);

        @Query("SELECT b FROM BookingEntity b " +
                        "LEFT JOIN FETCH b.vehicle v " +
                        "LEFT JOIN FETCH v.vehicleCategory " +
                        "LEFT JOIN FETCH b.rentalType " +
                        "LEFT JOIN FETCH b.pickupMethod " +
                        "WHERE b.driverId = :driverId AND b.status = :status")
        List<BookingEntity> findByDriverIdAndStatusWithDetails(@Param("driverId") Long driverId,
                        @Param("status") BookingStatus status);

        @Query("SELECT COUNT(b) FROM BookingEntity b WHERE (b.assignedStaffId = :staffId OR b.driverId = :staffId) AND b.status IN :statuses")
        int countActiveBookingsByStaff(@Param("staffId") Long staffId, @Param("statuses") List<BookingStatus> statuses);

        @Query("SELECT b FROM BookingEntity b " +
                        "LEFT JOIN FETCH b.vehicle " +
                        "LEFT JOIN FETCH b.rentalType " +
                        "LEFT JOIN FETCH b.pickupMethod " +
                        "ORDER BY b.startDate DESC")
        List<BookingEntity> findRecentBookingsWithVehicle(org.springframework.data.domain.Pageable pageable);

        @Query(value = """
                        SELECT
                            b.id,
                            b.booking_code,
                            b.customer_name,
                            b.start_date,
                            b.status,
                            vc.name,
                            vc.model
                        FROM bookings b
                        LEFT JOIN vehicles v ON v.id = b.vehicle_id
                        LEFT JOIN vehicle_categories vc ON vc.id = v.vehicle_category_id
                        ORDER BY b.id DESC
                        LIMIT 5
                        """, nativeQuery = true)
        List<Object[]> findRecentBookingSummaries();

        @Query("SELECT b FROM BookingEntity b " +
                        "LEFT JOIN FETCH b.vehicle " +
                        "LEFT JOIN FETCH b.rentalType " +
                        "LEFT JOIN FETCH b.pickupMethod " +
                        "ORDER BY b.createdAt DESC")
        List<BookingEntity> findAllWithVehicle();

        @Query("SELECT b FROM BookingEntity b WHERE b.startDate <= :date AND b.endDate >= :date AND b.status IN :statuses")
        List<BookingEntity> findActiveBookingsOnDate(@Param("date") LocalDate date,
                        @Param("statuses") List<BookingStatus> statuses);

        @Query("SELECT b FROM BookingEntity b " +
                        "LEFT JOIN FETCH b.vehicle v " +
                        "LEFT JOIN FETCH v.vehicleCategory " +
                        "LEFT JOIN FETCH b.rentalType " +
                        "LEFT JOIN FETCH b.pickupMethod " +
                        "WHERE b.startDate <= :date AND b.endDate >= :date AND b.status IN :statuses")
        List<BookingEntity> findActiveBookingsOnDateWithDetails(@Param("date") LocalDate date,
                        @Param("statuses") List<BookingStatus> statuses);

        @Query(value = """
                        SELECT
                            b.start_date AS startDate,
                            b.end_date AS endDate,
                            b.status AS status
                        FROM bookings b
                        WHERE b.vehicle_id = :vehicleId
                          AND b.status <> :cancelled
                          AND b.end_date >= :fromDate
                        ORDER BY b.start_date ASC
                        """, nativeQuery = true)
        List<UnavailableDateRangeProjection> findUnavailableBookingsByVehicle(@Param("vehicleId") Long vehicleId,
                        @Param("cancelled") String cancelled, @Param("fromDate") LocalDate fromDate);

        @Query("SELECT b.assignedStaffId AS userId, COUNT(b) AS count " +
                        "FROM BookingEntity b " +
                        "WHERE b.assignedStaffId IN :userIds AND b.status IN :statuses " +
                        "GROUP BY b.assignedStaffId")
        List<UserAssignmentCountProjection> countAssignmentsGroupedByAssignedStaff(
                        @Param("userIds") List<Long> userIds,
                        @Param("statuses") List<BookingStatus> statuses);

        @Query("SELECT b.driverId AS userId, COUNT(b) AS count " +
                        "FROM BookingEntity b " +
                        "WHERE b.driverId IN :userIds AND b.status IN :statuses " +
                        "GROUP BY b.driverId")
        List<UserAssignmentCountProjection> countAssignmentsGroupedByDriver(
                        @Param("userIds") List<Long> userIds,
                        @Param("statuses") List<BookingStatus> statuses);

        @Query("SELECT MONTH(b.startDate) as month, SUM(b.totalAmount) as revenue, COUNT(b) as count " +
                        "FROM BookingEntity b " +
                        "WHERE b.startDate >= :startDate AND b.startDate < :endDate AND b.status <> :cancelled " +
                        "GROUP BY MONTH(b.startDate) ORDER BY MONTH(b.startDate)")
        List<Object[]> findMonthlyRevenueByStartDateRange(@Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate, @Param("cancelled") BookingStatus cancelled);
}
