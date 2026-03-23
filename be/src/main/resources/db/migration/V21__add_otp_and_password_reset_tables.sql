-- =============================================
-- V21: Add missing tables and columns
-- =============================================

-- OTP codes table
CREATE TABLE IF NOT EXISTS otp_codes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  expires_at DATETIME NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_otp_email (email),
  INDEX idx_otp_expires_at (expires_at)
);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reset_token (token),
  INDEX idx_reset_email (email),
  INDEX idx_reset_expires_at (expires_at)
);

-- Add missing columns to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20) NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_days INT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS delivery_address VARCHAR(255) NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS delivery_distance_km DECIMAL(8,2) NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assigned_staff_id BIGINT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assigned_at DATETIME NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assigned_by BIGINT NULL;
