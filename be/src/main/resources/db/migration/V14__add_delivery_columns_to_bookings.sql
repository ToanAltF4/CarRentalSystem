-- Add delivery address and distance columns to bookings table
ALTER TABLE bookings
ADD COLUMN delivery_address VARCHAR(255) NULL,
ADD COLUMN delivery_distance_km DECIMAL(8,2) NULL;
