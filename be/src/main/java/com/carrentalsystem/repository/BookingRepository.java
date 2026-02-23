package com.carrentalsystem.repository;

import com.carrentalsystem.entity.BookingEntity;
import com.carrentalsystem.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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

    /**
     * Find booking by booking code.
     */
    Optional<BookingEntity> findByBookingCode(String bookingCode);

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

    @Query("SELECT b FROM BookingEntity b " +
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
            "LEFT JOIN FETCH b.vehicle " +
            "LEFT JOIN FETCH b.rentalType " +
            "LEFT JOIN FETCH b.pickupMethod " +
            "ORDER BY b.createdAt DESC")
    List<BookingEntity> findAllWithVehicle();

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
}
