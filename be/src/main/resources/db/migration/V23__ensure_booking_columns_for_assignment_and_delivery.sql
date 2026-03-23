-- Ensure legacy databases contain all columns used by BookingEntity.
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20) NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_days INT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS delivery_address VARCHAR(255) NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS delivery_distance_km DECIMAL(8,2) NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assigned_staff_id BIGINT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assigned_at DATETIME NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assigned_by BIGINT NULL;
