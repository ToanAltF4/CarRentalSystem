package com.carrentalsystem.repository;

import com.carrentalsystem.entity.BookingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Map;

@Repository
public interface DashboardRepository extends JpaRepository<BookingEntity, Long> {

    @Query(value = "SELECT " +
            "i.totalRevenue as totalRevenue, " +
            "b.totalBookings as totalBookings, " +
            "b.activeRentals as activeRentals, " +
            "b.pendingBookings as pendingBookings, " +
            "v.availableVehicles as availableVehicles, " +
            "v.totalVehicles as totalVehicles " +
            "FROM " +
            "(SELECT " +
            "COUNT(*) as totalBookings, " +
            "SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as activeRentals, " +
            "SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pendingBookings " +
            "FROM bookings) b " +
            "CROSS JOIN " +
            "(SELECT " +
            "COUNT(*) as totalVehicles, " +
            "SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) as availableVehicles " +
            "FROM vehicles) v " +
            "CROSS JOIN " +
            "(SELECT COALESCE(SUM(total_amount), 0) as totalRevenue " +
            "FROM invoices WHERE payment_status = 'PAID') i", nativeQuery = true)
    Map<String, Object> getDashboardStats();
}
