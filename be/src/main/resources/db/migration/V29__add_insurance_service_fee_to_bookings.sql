-- Add insurance_fee and service_fee columns to bookings table
ALTER TABLE bookings ADD COLUMN insurance_fee DECIMAL(12,2) DEFAULT 0 AFTER delivery_distance_km;
ALTER TABLE bookings ADD COLUMN service_fee DECIMAL(12,2) DEFAULT 0 AFTER insurance_fee;

-- Backfill existing bookings with 0
UPDATE bookings SET insurance_fee = 0 WHERE insurance_fee IS NULL;
UPDATE bookings SET service_fee = 0 WHERE service_fee IS NULL;
