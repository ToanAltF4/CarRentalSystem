package com.carrentalsystem.repository;

import com.carrentalsystem.entity.BookingEntity;
import com.carrentalsystem.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Booking operations.
 */
@Repository
public interface BookingRepository extends JpaRepository<BookingEntity, Long> {

    interface UserAssignmentCountProjection {
        Long getUserId();

        Long getCount();
    }

    interface MonthlyRevenueProjection {
        Integer getMonth();

        java.math.BigDecimal getRevenue();

        Long getBookingCount();
    }

    /**
     * Find booking by booking code.
     */
    Optional<BookingEntity> findByBookingCode(String bookingCode);

    @Query("SELECT DISTINCT b FROM BookingEntity b " +
            "LEFT JOIN FETCH b.vehicle v " +
            "LEFT JOIN FETCH v.vehicleCategory " +
            "LEFT JOIN FETCH b.rentalType " +
            "LEFT JOIN FETCH b.pickupMethod " +
            "WHERE b.bookingCode = :bookingCode")
    Optional<BookingEntity> findByBookingCodeWithDetails(@Param("bookingCode") String bookingCode);

    @Query("SELECT DISTINCT b FROM BookingEntity b " +
            "LEFT JOIN FETCH b.vehicle v " +
            "LEFT JOIN FETCH v.vehicleCategory vc " +
            "LEFT JOIN FETCH vc.images " +
            "LEFT JOIN FETCH b.rentalType " +
            "LEFT JOIN FETCH b.pickupMethod " +
            "WHERE b.id = :id")
    Optional<BookingEntity> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT b FROM BookingEntity b " +
            "LEFT JOIN FETCH b.vehicle v " +
            "LEFT JOIN FETCH v.vehicleCategory " +
            "WHERE b.id = :id")
    Optional<BookingEntity> findByIdWithVehicleCategory(@Param("id") Long id);

    /**
     * Find bookings by vehicle ID.
     */
    List<BookingEntity> findByVehicleIdOrderByCreatedAtDesc(Long vehicleId);

    @Query("SELECT b FROM BookingEntity b " +
            "LEFT JOIN FETCH b.vehicle v " +
            "LEFT JOIN FETCH v.vehicleCategory " +
            "LEFT JOIN FETCH b.rentalType " +
            "LEFT JOIN FETCH b.pickupMethod " +
            "WHERE v.id = :vehicleId ORDER BY b.createdAt DESC")
    List<BookingEntity> findByVehicleIdOrderByCreatedAtDescWithDetails(@Param("vehicleId") Long vehicleId);

    /**
     * Find bookings by status.
     */
    List<BookingEntity> findByStatusOrderByCreatedAtDesc(BookingStatus status);

    @Query("SELECT b FROM BookingEntity b " +
            "LEFT JOIN FETCH b.vehicle v " +
            "LEFT JOIN FETCH v.vehicleCategory " +
            "LEFT JOIN FETCH b.rentalType " +
            "LEFT JOIN FETCH b.pickupMethod " +
            "WHERE b.status = :status ORDER BY b.createdAt DESC")
    List<BookingEntity> findByStatusOrderByCreatedAtDescWithDetails(@Param("status") BookingStatus status);

    /**
     * Find bookings by customer email.
     */
    List<BookingEntity> findByCustomerEmailOrderByCreatedAtDesc(String customerEmail);

    @Query("SELECT DISTINCT b FROM BookingEntity b " +
            "LEFT JOIN FETCH b.vehicle v " +
            "LEFT JOIN FETCH v.vehicleCategory " +
            "LEFT JOIN FETCH b.rentalType " +
            "LEFT JOIN FETCH b.pickupMethod " +
            "WHERE b.customerEmail = :customerEmail ORDER BY b.createdAt DESC")
    List<BookingEntity> findByCustomerEmailOrderByCreatedAtDescWithDetails(
            @Param("customerEmail") String customerEmail);

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
     * Count bookings by status.
     */
    long countByStatus(BookingStatus status);

    List<BookingEntity> findByStatusAndCreatedAtBefore(BookingStatus status, LocalDateTime createdAt);

    List<BookingEntity> findByAssignedStaffId(Long staffId);

    @Query("SELECT b FROM BookingEntity b " +
            "LEFT JOIN FETCH b.vehicle v " +
            "LEFT JOIN FETCH v.vehicleCategory " +
            "LEFT JOIN FETCH b.rentalType " +
            "LEFT JOIN FETCH b.pickupMethod " +
            "WHERE b.assignedStaffId = :staffId")
    List<BookingEntity> findByAssignedStaffIdWithDetails(@Param("staffId") Long staffId);

    List<BookingEntity> findByDriverId(Long driverId);

    @Query("SELECT DISTINCT b FROM BookingEntity b " +
            "LEFT JOIN FETCH b.vehicle v " +
            "LEFT JOIN FETCH v.vehicleCategory " +
            "LEFT JOIN FETCH v.vehicleCategory.images " +
            "LEFT JOIN FETCH b.rentalType " +
            "LEFT JOIN FETCH b.pickupMethod " +
            "WHERE b.driverId = :driverId")
    List<BookingEntity> findByDriverIdWithDetails(@Param("driverId") Long driverId);

    List<BookingEntity> findByDriverIdAndStatus(Long driverId, BookingStatus status);

    @Query("SELECT DISTINCT b FROM BookingEntity b " +
            "LEFT JOIN FETCH b.vehicle v " +
            "LEFT JOIN FETCH v.vehicleCategory " +
            "LEFT JOIN FETCH v.vehicleCategory.images " +
            "LEFT JOIN FETCH b.rentalType " +
            "LEFT JOIN FETCH b.pickupMethod " +
            "WHERE b.driverId = :driverId AND b.status = :status")
    List<BookingEntity> findByDriverIdAndStatusWithDetails(@Param("driverId") Long driverId,
            @Param("status") BookingStatus status);

    @Query("SELECT COUNT(b) FROM BookingEntity b WHERE (b.assignedStaffId = :staffId OR b.driverId = :staffId) AND b.status IN :statuses")
    int countActiveBookingsByStaff(@Param("staffId") Long staffId, @Param("statuses") List<BookingStatus> statuses);

    /**
     * Fetch all bookings where the user is either the assigned staff or the driver.
     * Replaces two separate queries (findByAssignedStaffIdWithDetails + findByDriverIdWithDetails)
     * that were previously merged in memory.
     */
    @Query("SELECT DISTINCT b FROM BookingEntity b " +
            "LEFT JOIN FETCH b.vehicle v " +
            "LEFT JOIN FETCH v.vehicleCategory " +
            "LEFT JOIN FETCH v.vehicleCategory.images " +
            "LEFT JOIN FETCH b.rentalType " +
            "LEFT JOIN FETCH b.pickupMethod " +
            "WHERE b.assignedStaffId = :staffId OR b.driverId = :staffId")
    List<BookingEntity> findByStaffOrDriverIdWithDetails(@Param("staffId") Long staffId);

    @Query("SELECT b FROM BookingEntity b " +
            "LEFT JOIN FETCH b.vehicle v " +
            "LEFT JOIN FETCH v.vehicleCategory " +
            "LEFT JOIN FETCH b.rentalType " +
            "LEFT JOIN FETCH b.pickupMethod " +
            "ORDER BY b.createdAt DESC")
    List<BookingEntity> findRecentBookingsWithVehicle(org.springframework.data.domain.Pageable pageable);

    @Query(value = """
            SELECT
                b.id,
                b.booking_code,
                b.customer_name,
                b.created_at,
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
            "LEFT JOIN FETCH b.vehicle v " +
            "LEFT JOIN FETCH v.vehicleCategory " +
            "LEFT JOIN FETCH b.rentalType " +
            "LEFT JOIN FETCH b.pickupMethod " +
            "ORDER BY b.createdAt DESC")
    List<BookingEntity> findAllWithVehicle();

    /**
     * Find non-cancelled, non-completed bookings whose end date is on or after today,
     * ordered by start date ascending. Used by getUpcomingBookings() to avoid loading
     * the entire bookings table into memory.
     */
    @Query("SELECT b FROM BookingEntity b " +
            "LEFT JOIN FETCH b.vehicle v " +
            "LEFT JOIN FETCH v.vehicleCategory " +
            "LEFT JOIN FETCH b.rentalType " +
            "LEFT JOIN FETCH b.pickupMethod " +
            "WHERE b.status NOT IN :excludedStatuses " +
            "AND b.endDate >= :today " +
            "ORDER BY b.startDate ASC")
    List<BookingEntity> findUpcomingWithDetails(
            @Param("excludedStatuses") List<BookingStatus> excludedStatuses,
            @Param("today") LocalDate today);

    /**
     * Find active bookings for a vehicle whose date range overlaps the requested window.
     * Used by findConflictingDates() to pre-filter bookings before in-memory date parsing,
     * avoiding a full vehicle-booking table scan.
     */
    @Query("SELECT b FROM BookingEntity b " +
            "WHERE b.vehicle.id = :vehicleId " +
            "AND b.status NOT IN :excludedStatuses " +
            "AND b.endDate >= :minDate " +
            "AND b.startDate <= :maxDate")
    List<BookingEntity> findActiveByVehicleIdAndDateRange(
            @Param("vehicleId") Long vehicleId,
            @Param("excludedStatuses") List<BookingStatus> excludedStatuses,
            @Param("minDate") LocalDate minDate,
            @Param("maxDate") LocalDate maxDate);

    @Query("SELECT b FROM BookingEntity b " +
            "LEFT JOIN FETCH b.vehicle v " +
            "LEFT JOIN FETCH v.vehicleCategory " +
            "LEFT JOIN FETCH b.rentalType " +
            "LEFT JOIN FETCH b.pickupMethod " +
            "WHERE b.status IN :statuses " +
            "AND b.startDate <= :targetDate " +
            "AND b.endDate >= :targetDate " +
            "ORDER BY b.createdAt DESC")
    List<BookingEntity> findByStatusesAndDateOverlapWithDetails(
            @Param("statuses") List<BookingStatus> statuses,
            @Param("targetDate") LocalDate targetDate);

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

    @Query(value = """
            SELECT b.assigned_staff_id AS userId, COUNT(*) AS count
            FROM bookings b
            WHERE b.assigned_staff_id IN (:userIds)
              AND b.status IN ('ASSIGNED', 'CONFIRMED', 'IN_PROGRESS', 'ONGOING')
            GROUP BY b.assigned_staff_id
            """, nativeQuery = true)
    List<UserAssignmentCountProjection> countActiveAssignmentsGroupedByAssignedStaff(@Param("userIds") List<Long> userIds);

    @Query(value = """
            SELECT b.driver_id AS userId, COUNT(*) AS count
            FROM bookings b
            WHERE b.driver_id IN (:userIds)
              AND b.status IN ('ASSIGNED', 'CONFIRMED', 'IN_PROGRESS', 'ONGOING')
            GROUP BY b.driver_id
            """, nativeQuery = true)
    List<UserAssignmentCountProjection> countActiveAssignmentsGroupedByDriver(@Param("userIds") List<Long> userIds);

    @Query(value = """
            SELECT
                MONTH(b.start_date) AS month,
                COALESCE(SUM(b.total_amount), 0) AS revenue,
                COUNT(*) AS bookingCount
            FROM bookings b
            WHERE b.status NOT IN ('CANCELLED', 'PENDING')
              AND YEAR(b.start_date) = :year
            GROUP BY MONTH(b.start_date)
            ORDER BY MONTH(b.start_date)
            """, nativeQuery = true)
    List<MonthlyRevenueProjection> aggregateMonthlyRevenue(@Param("year") Integer year);

    // ── Report projections ──────────────────────────────────────────

    interface StatusCountProjection {
        String getStatus();
        Long getCount();
    }

    interface RevenueByCategoryProjection {
        String getCategoryName();
        String getBrand();
        java.math.BigDecimal getRevenue();
        Long getBookingCount();
    }

    interface TopVehicleProjection {
        Long getVehicleId();
        String getCategoryName();
        String getBrand();
        String getLicensePlate();
        Long getBookingCount();
        java.math.BigDecimal getTotalRevenue();
    }

    interface DailyTrendProjection {
        String getDate();
        Long getBookingCount();
        java.math.BigDecimal getRevenue();
    }

    // ── Report queries ──────────────────────────────────────────────

    @Query(value = """
            SELECT b.status AS status, COUNT(*) AS count
            FROM bookings b
            WHERE b.created_at >= :from AND b.created_at < :to
            GROUP BY b.status
            """, nativeQuery = true)
    List<StatusCountProjection> countBookingsByStatusInRange(
            @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query(value = """
            SELECT vc.name AS categoryName, vc.brand AS brand,
                   COALESCE(SUM(b.total_amount), 0) AS revenue,
                   COUNT(*) AS bookingCount
            FROM bookings b
            JOIN vehicles v ON v.id = b.vehicle_id
            JOIN vehicle_categories vc ON vc.id = v.vehicle_category_id
            WHERE b.status NOT IN ('CANCELLED', 'PENDING')
              AND b.created_at >= :from AND b.created_at < :to
            GROUP BY vc.id, vc.name, vc.brand
            ORDER BY revenue DESC
            """, nativeQuery = true)
    List<RevenueByCategoryProjection> revenueByCategory(
            @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query(value = """
            SELECT v.id AS vehicleId, vc.name AS categoryName, vc.brand AS brand,
                   v.license_plate AS licensePlate,
                   COUNT(*) AS bookingCount,
                   COALESCE(SUM(b.total_amount), 0) AS totalRevenue
            FROM bookings b
            JOIN vehicles v ON v.id = b.vehicle_id
            JOIN vehicle_categories vc ON vc.id = v.vehicle_category_id
            WHERE b.status NOT IN ('CANCELLED', 'PENDING')
              AND b.created_at >= :from AND b.created_at < :to
            GROUP BY v.id, vc.name, vc.brand, v.license_plate
            ORDER BY bookingCount DESC
            LIMIT :lim
            """, nativeQuery = true)
    List<TopVehicleProjection> topVehicles(
            @Param("from") LocalDateTime from, @Param("to") LocalDateTime to,
            @Param("lim") int lim);

    @Query(value = """
            SELECT DATE(b.created_at) AS date,
                   COUNT(*) AS bookingCount,
                   COALESCE(SUM(b.total_amount), 0) AS revenue
            FROM bookings b
            WHERE b.status NOT IN ('CANCELLED', 'PENDING')
              AND b.created_at >= :from AND b.created_at < :to
            GROUP BY DATE(b.created_at)
            ORDER BY DATE(b.created_at)
            """, nativeQuery = true)
    List<DailyTrendProjection> dailyBookingTrend(
            @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
