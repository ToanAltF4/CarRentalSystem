package com.carrentalsystem.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Ensures legacy databases have all booking columns required by current entities.
 * This prevents runtime SQL errors when Flyway is disabled in local environments.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BookingSchemaHotfixRunner implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        ensureColumn("bookings", "customer_phone", "VARCHAR(20) NULL");
        ensureColumn("bookings", "total_days", "INT NULL");
        ensureColumn("bookings", "selected_dates", "TEXT NULL");
        ensureColumn("bookings", "delivery_address", "VARCHAR(255) NULL");
        ensureColumn("bookings", "delivery_distance_km", "DECIMAL(8,2) NULL");
        ensureColumn("bookings", "driver_id", "BIGINT NULL");
        ensureColumn("bookings", "notes", "TEXT NULL");
        ensureColumn("bookings", "assigned_staff_id", "BIGINT NULL");
        ensureColumn("bookings", "assigned_at", "DATETIME NULL");
        ensureColumn("bookings", "assigned_by", "BIGINT NULL");
    }

    private void ensureColumn(String tableName, String columnName, String definition) {
        try {
            Integer count = jdbcTemplate.queryForObject(
                    """
                            SELECT COUNT(*)
                            FROM information_schema.columns
                            WHERE table_schema = DATABASE()
                              AND table_name = ?
                              AND column_name = ?
                            """,
                    Integer.class,
                    tableName,
                    columnName);

            if (count != null && count == 0) {
                jdbcTemplate.execute("ALTER TABLE " + tableName + " ADD COLUMN " + columnName + " " + definition);
                log.warn("Applied schema hotfix: added {}.{}", tableName, columnName);
            }
        } catch (Exception ex) {
            log.error("Failed ensuring column {}.{}: {}", tableName, columnName, ex.getMessage());
        }
    }
}
