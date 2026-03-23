-- Migration V16: Update inspections table for Pickup/Return process

-- Drop conflicting table if exists
DROP TABLE IF EXISTS handover_records;

-- Drop old inspections table
DROP TABLE IF EXISTS inspections;

-- Create new inspections table
CREATE TABLE inspections (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT,
  inspection_type VARCHAR(20) NOT NULL COMMENT 'PICKUP or RETURN',
  battery_level INT,
  odometer INT,
  charging_cable_present BOOLEAN DEFAULT 1,
  exterior_condition VARCHAR(30),
  interior_condition VARCHAR(30),
  has_damage BOOLEAN,
  damage_description TEXT,
  damage_photos TEXT,
  inspected_by BIGINT,
  inspection_notes TEXT,
  inspected_at DATETIME,
  created_at DATETIME,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_inspection_booking ON inspections(booking_id);
