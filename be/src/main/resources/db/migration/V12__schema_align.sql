-- Align schema to inline status fields and remove deprecated lookup tables

-- 1) Vehicles: status_id -> status (VARCHAR)
ALTER TABLE vehicles
    ADD COLUMN IF NOT EXISTS status VARCHAR(30) NULL;

SET @has_vehicle_statuses := (
    SELECT COUNT(*) FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'vehicle_statuses'
);
SET @sql := IF(@has_vehicle_statuses > 0,
    'UPDATE vehicles v JOIN vehicle_statuses s ON v.status_id = s.id SET v.status = s.code',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx := (
    SELECT INDEX_NAME
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'vehicles'
      AND index_name = 'idx_vehicles_status'
    LIMIT 1
);
SET @sql := IF(@idx IS NULL, 'SELECT 1', CONCAT('DROP INDEX ', @idx, ' ON vehicles'));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

ALTER TABLE vehicles
    DROP COLUMN IF EXISTS status_id;

-- 2) Bookings: status_id -> status (VARCHAR)
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS status VARCHAR(30) NULL;

SET @has_booking_statuses := (
    SELECT COUNT(*) FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'booking_statuses'
);
SET @sql := IF(@has_booking_statuses > 0,
    'UPDATE bookings b JOIN booking_statuses s ON b.status_id = s.id SET b.status = s.code',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx := (
    SELECT INDEX_NAME
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'bookings'
      AND index_name = 'idx_booking_status'
    LIMIT 1
);
SET @sql := IF(@idx IS NULL, 'SELECT 1', CONCAT('DROP INDEX ', @idx, ' ON bookings'));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

ALTER TABLE bookings
    DROP COLUMN IF EXISTS status_id;

-- 3) Users: license_status_id -> license_status (VARCHAR)
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS license_status VARCHAR(30) NULL;

SET @has_license_statuses := (
    SELECT COUNT(*) FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'license_statuses'
);
SET @sql := IF(@has_license_statuses > 0,
    'UPDATE users u JOIN license_statuses s ON u.license_status_id = s.id SET u.license_status = s.code',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk := (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'license_status_id'
      AND REFERENCED_TABLE_NAME = 'license_statuses'
    LIMIT 1
);
SET @sql := IF(@fk IS NULL, 'SELECT 1', CONCAT('ALTER TABLE users DROP FOREIGN KEY ', @fk));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

ALTER TABLE users
    DROP COLUMN IF EXISTS license_status_id;

-- 4) Drivers: status_id -> status (VARCHAR)
ALTER TABLE drivers
    ADD COLUMN IF NOT EXISTS status VARCHAR(30) NULL;

SET @has_driver_statuses := (
    SELECT COUNT(*) FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'driver_statuses'
);
SET @sql := IF(@has_driver_statuses > 0,
    'UPDATE drivers d JOIN driver_statuses s ON d.status_id = s.id SET d.status = s.code',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk := (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'drivers'
      AND COLUMN_NAME = 'status_id'
      AND REFERENCED_TABLE_NAME = 'driver_statuses'
    LIMIT 1
);
SET @sql := IF(@fk IS NULL, 'SELECT 1', CONCAT('ALTER TABLE drivers DROP FOREIGN KEY ', @fk));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

ALTER TABLE drivers
    DROP COLUMN IF EXISTS status_id;

-- 5) Drop deprecated lookup tables
DROP TABLE IF EXISTS vehicle_statuses;
DROP TABLE IF EXISTS booking_statuses;
DROP TABLE IF EXISTS license_statuses;
DROP TABLE IF EXISTS driver_statuses;

-- 6) Drop vehicle_last_location (use vehicle_locations only)
DROP TABLE IF EXISTS vehicle_last_location;
