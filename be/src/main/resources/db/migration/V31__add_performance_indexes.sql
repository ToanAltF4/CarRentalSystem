-- Add missing indexes on bookings table to eliminate full-table scans on
-- frequently queried columns: customer_email, assigned_staff_id, driver_id, end_date, created_at.

SET @idx := (SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND INDEX_NAME = 'idx_booking_customer_email');
SET @sql := IF(@idx = 0, 'CREATE INDEX idx_booking_customer_email ON bookings(customer_email)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx := (SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND INDEX_NAME = 'idx_booking_assigned_staff_id');
SET @sql := IF(@idx = 0, 'CREATE INDEX idx_booking_assigned_staff_id ON bookings(assigned_staff_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx := (SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND INDEX_NAME = 'idx_booking_driver_id');
SET @sql := IF(@idx = 0, 'CREATE INDEX idx_booking_driver_id ON bookings(driver_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx := (SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND INDEX_NAME = 'idx_booking_end_date');
SET @sql := IF(@idx = 0, 'CREATE INDEX idx_booking_end_date ON bookings(end_date)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx := (SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND INDEX_NAME = 'idx_booking_created_at');
SET @sql := IF(@idx = 0, 'CREATE INDEX idx_booking_created_at ON bookings(created_at)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
