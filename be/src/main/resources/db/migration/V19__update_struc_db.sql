-- =========================================================
-- FULL DATABASE SCHEMA (MySQL 8)
-- EV Car Rental System
-- Model catalog in vehicle_categories + multi images
-- Driver is a USER (role DRIVER), no drivers table
-- =========================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS vehicle_locations;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS inspections;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS delivery_pricing;
DROP TABLE IF EXISTS driver_pricing;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS pricing;
DROP TABLE IF EXISTS vehicle_category_images;
DROP TABLE IF EXISTS vehicle_categories;
DROP TABLE IF EXISTS pickup_methods;
DROP TABLE IF EXISTS rental_types;
DROP TABLE IF EXISTS payment_methods;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================
-- LOOKUP TABLES
-- =========================

CREATE TABLE payment_methods (
  id TINYINT PRIMARY KEY,
  code VARCHAR(30) UNIQUE,
  name VARCHAR(50)
);

CREATE TABLE rental_types (
  id TINYINT PRIMARY KEY,
  code VARCHAR(30) UNIQUE,
  name VARCHAR(50)
);

CREATE TABLE pickup_methods (
  id TINYINT PRIMARY KEY,
  code VARCHAR(30) UNIQUE,
  name VARCHAR(50)
);

-- =========================
-- RBAC
-- =========================

CREATE TABLE roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(50) UNIQUE,
  description VARCHAR(255)
);

-- =========================
-- VEHICLE CATALOG (1 ROW = 1 MODEL/VARIANT)
-- brand | name(line) | model(variant) + specs
-- =========================

CREATE TABLE vehicle_categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,

  brand VARCHAR(80) NOT NULL,        -- Tesla
  name  VARCHAR(120) NOT NULL,       -- Tesla 3 (dòng xe)
  model VARCHAR(120) NOT NULL,       -- tesla3model_1 (phiên bản)

  seats INT NULL,
  battery_capacity_kwh DECIMAL(6,2) NULL,
  range_km INT NULL,
  charging_time_hours DECIMAL(5,2) NULL,

  description TEXT NULL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (brand, name, model)
);

CREATE INDEX idx_vehicle_categories_brand ON vehicle_categories(brand);
CREATE INDEX idx_vehicle_categories_name  ON vehicle_categories(name);

-- =========================
-- MULTI IMAGES FOR EACH MODEL
-- =========================

CREATE TABLE vehicle_category_images (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,

  vehicle_category_id BIGINT NOT NULL,
  image_url VARCHAR(500) NOT NULL,

  is_primary BOOLEAN DEFAULT 0,   -- ảnh đại diện
  sort_order INT DEFAULT 0,       -- thứ tự hiển thị

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_vehicle_category_images_category
    FOREIGN KEY (vehicle_category_id) REFERENCES vehicle_categories(id)
);

CREATE INDEX idx_vehicle_category_images_category
  ON vehicle_category_images(vehicle_category_id);

CREATE INDEX idx_vehicle_category_images_primary
  ON vehicle_category_images(vehicle_category_id, is_primary);

-- =========================
-- PRICING (BY MODEL ROW)
-- =========================

CREATE TABLE pricing (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,

  vehicle_category_id BIGINT NOT NULL,   -- -> vehicle_categories.id (model row)

  daily_price DECIMAL(10,2) NOT NULL,
  weekly_price DECIMAL(10,2) NULL,
  monthly_price DECIMAL(10,2) NULL,
  overtime_fee_per_hour DECIMAL(10,2) NOT NULL,

  effective_from DATE NOT NULL,
  effective_to DATE NULL,
  is_active BOOLEAN DEFAULT 1,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_pricing_vehicle_category
    FOREIGN KEY (vehicle_category_id) REFERENCES vehicle_categories(id)
);

CREATE INDEX idx_pricing_vehicle_category ON pricing(vehicle_category_id);
CREATE INDEX idx_pricing_effective
  ON pricing(vehicle_category_id, effective_from, effective_to, is_active);

-- =========================
-- VEHICLES (PHYSICAL CAR)
-- =========================

CREATE TABLE vehicles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,

  vehicle_category_id BIGINT NOT NULL,  -- -> vehicle_categories (model/spec)

  license_plate VARCHAR(20) NOT NULL UNIQUE,
  status VARCHAR(30) NOT NULL,          -- AVAILABLE/RENTED/MAINTENANCE/...

  -- per-car fields (optional but useful)
  vin VARCHAR(50) NULL UNIQUE,
  odometer INT NULL,
  current_battery_percent INT NULL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_vehicles_vehicle_category
    FOREIGN KEY (vehicle_category_id) REFERENCES vehicle_categories(id)
);

CREATE INDEX idx_vehicles_vehicle_category ON vehicles(vehicle_category_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);

-- =========================
-- USERS (Driver is also a user)
-- =========================

CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,

  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),

  role_id BIGINT NOT NULL,
  phone VARCHAR(20),

  -- License info (self-drive customer + driver đều dùng được)
  license_type VARCHAR(50),
  license_number VARCHAR(50),
  license_front_image_url VARCHAR(500),
  license_status VARCHAR(30),

  date_of_birth DATE,
  status VARCHAR(30),

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_users_role
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE INDEX idx_users_role ON users(role_id);

CREATE TABLE refresh_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNIQUE,
  token VARCHAR(500),
  expiry_date TIMESTAMP,
  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =========================
-- DRIVER / DELIVERY PRICING
-- =========================

CREATE TABLE driver_pricing (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  daily_fee DECIMAL(10,2) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE NULL,
  is_active BOOLEAN DEFAULT 1
);

CREATE INDEX idx_driver_pricing_effective
  ON driver_pricing(effective_from, effective_to, is_active);

CREATE TABLE delivery_pricing (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  base_fee DECIMAL(10,2) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE NULL,
  is_active BOOLEAN DEFAULT 1
);

CREATE INDEX idx_delivery_pricing_effective
  ON delivery_pricing(effective_from, effective_to, is_active);

-- =========================
-- BOOKINGS (driver_user_id -> users)
-- =========================

CREATE TABLE bookings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,

  booking_code VARCHAR(20) UNIQUE,

  vehicle_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,              -- customer
  driver_user_id BIGINT NULL,           -- driver user (role DRIVER)

  rental_type_id TINYINT NOT NULL,
  pickup_method_id TINYINT NOT NULL,

  customer_name VARCHAR(100),
  customer_email VARCHAR(100),

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- snapshot pricing (đóng băng lúc đặt)
  daily_rate DECIMAL(10,2),
  rental_fee DECIMAL(12,2),
  driver_fee DECIMAL(12,2),
  delivery_fee DECIMAL(12,2),
  total_amount DECIMAL(12,2),

  status VARCHAR(30),

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_bookings_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),

  CONSTRAINT fk_bookings_user
    FOREIGN KEY (user_id) REFERENCES users(id),

  CONSTRAINT fk_bookings_driver_user
    FOREIGN KEY (driver_user_id) REFERENCES users(id),

  CONSTRAINT fk_bookings_rental_type
    FOREIGN KEY (rental_type_id) REFERENCES rental_types(id),

  CONSTRAINT fk_bookings_pickup_method
    FOREIGN KEY (pickup_method_id) REFERENCES pickup_methods(id)
);

CREATE INDEX idx_bookings_vehicle_dates ON bookings(vehicle_id, start_date, end_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_driver_user ON bookings(driver_user_id);

-- =========================
-- INSPECTIONS (handover & return unified)
-- =========================

CREATE TABLE inspections (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,

  booking_id BIGINT NOT NULL,
  inspection_type VARCHAR(20) NOT NULL,     -- HANDOVER / RETURN (quy ước của bạn)

  battery_level INT,
  odometer INT,
  charging_cable_present BOOLEAN DEFAULT 1,
  exterior_condition VARCHAR(30),
  interior_condition VARCHAR(30),

  has_damage BOOLEAN,
  damage_description TEXT,
  damage_photos TEXT,                       -- URL list JSON/string tuỳ bạn

  inspected_by BIGINT NULL,                 -- staff user id
  inspection_notes TEXT,

  inspected_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_inspections_booking
    FOREIGN KEY (booking_id) REFERENCES bookings(id),

  CONSTRAINT fk_inspections_inspected_by
    FOREIGN KEY (inspected_by) REFERENCES users(id)
);

CREATE INDEX idx_inspection_booking ON inspections(booking_id);
CREATE INDEX idx_inspection_type ON inspections(inspection_type);

-- =========================
-- INVOICES / PAYMENTS
-- =========================

CREATE TABLE invoices (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,

  invoice_number VARCHAR(30) UNIQUE,
  booking_id BIGINT UNIQUE NOT NULL,

  rental_fee DECIMAL(12,2),
  driver_fee DECIMAL(12,2),
  delivery_fee DECIMAL(12,2),
  damage_fee DECIMAL(10,2),
  total_amount DECIMAL(12,2),

  payment_status VARCHAR(30),

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_invoices_booking
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE INDEX idx_invoice_payment_status ON invoices(payment_status);

CREATE TABLE payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,

  invoice_id BIGINT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,

  payment_method_id TINYINT NOT NULL,
  payment_status VARCHAR(30),

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_payments_invoice
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),

  CONSTRAINT fk_payments_method
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
);

CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_status ON payments(payment_status);

-- =========================
-- GPS / LOCATION LOG
-- =========================

CREATE TABLE vehicle_locations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,

  vehicle_id BIGINT NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_vehicle_locations_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

CREATE INDEX idx_vehicle_locations_vehicle_time
  ON vehicle_locations(vehicle_id, recorded_at)

