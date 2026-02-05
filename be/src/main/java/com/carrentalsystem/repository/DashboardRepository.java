package com.carrentalsystem.repository;

import com.carrentalsystem.entity.BookingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Map;

@Repository
public interface DashboardRepository extends JpaRepository<BookingEntity, Long> {

    @Query(value = "SELECT " +
            "(SELECT COALESCE(SUM(total_amount), 0) FROM invoices WHERE payment_status = 'PAID') as totalRevenue, " +
            "(SELECT COUNT(*) FROM bookings) as totalBookings, " +
            "(SELECT COUNT(*) FROM bookings WHERE status = 'IN_PROGRESS') as activeRentals, " +
            "(SELECT COUNT(*) FROM bookings WHERE status = 'PENDING') as pendingBookings, " +
            "(SELECT COUNT(*) FROM vehicles WHERE status = 'AVAILABLE') as availableVehicles, " +
            "(SELECT COUNT(*) FROM vehicles) as totalVehicles", nativeQuery = true)
    Map<String, Object> getDashboardStats();
}
