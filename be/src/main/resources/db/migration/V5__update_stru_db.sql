SET FOREIGN_KEY_CHECKS = 0;

-- =========================
-- DROP EXISTING TABLES
-- =========================

DROP TABLE IF EXISTS vehicle_last_location;
DROP TABLE IF EXISTS vehicle_locations;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS inspections;
DROP TABLE IF EXISTS handover_records;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS delivery_pricing;
DROP TABLE IF EXISTS driver_pricing;
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS driver_licenses;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS pricing;
DROP TABLE IF EXISTS vehicle_categories;
DROP TABLE IF EXISTS license_statuses;
DROP TABLE IF EXISTS pickup_methods;
DROP TABLE IF EXISTS rental_types;
DROP TABLE IF EXISTS driver_statuses;
DROP TABLE IF EXISTS payment_methods;
DROP TABLE IF EXISTS payment_statuses;
DROP TABLE IF EXISTS invoice_payment_statuses;
DROP TABLE IF EXISTS condition_types;
DROP TABLE IF EXISTS booking_statuses;
DROP TABLE IF EXISTS vehicle_statuses;

-- =========================
-- LOOKUP TABLES (NO ENUM)
-- =========================

CREATE TABLE vehicle_statuses (
  id TINYINT PRIMARY KEY,
  code VARCHAR(30) UNIQUE,
  name VARCHAR(50)
);

CREATE TABLE booking_statuses (
  id TINYINT PRIMARY KEY,
  code VARCHAR(30) UNIQUE,
  name VARCHAR(50)
);

CREATE TABLE condition_types (
  id TINYINT PRIMARY KEY,
  code VARCHAR(30) UNIQUE,
  name VARCHAR(50)
);

CREATE TABLE invoice_payment_statuses (
  id TINYINT PRIMARY KEY,
  code VARCHAR(30) UNIQUE,
  name VARCHAR(50)
);

CREATE TABLE payment_statuses (
  id TINYINT PRIMARY KEY,
  code VARCHAR(30) UNIQUE,
  name VARCHAR(50)
);

CREATE TABLE payment_methods (
  id TINYINT PRIMARY KEY,
  code VARCHAR(30) UNIQUE,
  name VARCHAR(50)
);

CREATE TABLE driver_statuses (
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

CREATE TABLE license_statuses (
  id TINYINT PRIMARY KEY,
  code VARCHAR(30) UNIQUE,
  name VARCHAR(50)
);

-- =========================
-- VEHICLES & PRICING
-- =========================

CREATE TABLE vehicle_categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE,
  description VARCHAR(255)
);

CREATE TABLE pricing (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  vehicle_category_id BIGINT,
  daily_price DECIMAL(10,2),
  weekly_price DECIMAL(10,2),
  monthly_price DECIMAL(10,2),
  overtime_fee_per_hour DECIMAL(8,2),
  effective_from DATE,
  effective_to DATE,
  is_active BOOLEAN,
  FOREIGN KEY (vehicle_category_id) REFERENCES vehicle_categories(id)
);

CREATE TABLE vehicles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  model VARCHAR(100),
  brand VARCHAR(50),
  license_plate VARCHAR(20) UNIQUE,
  daily_rate DECIMAL(10,2),
  status_id TINYINT,
  category_id BIGINT,
  FOREIGN KEY (status_id) REFERENCES vehicle_statuses(id),
  FOREIGN KEY (category_id) REFERENCES vehicle_categories(id)
);

-- =========================
-- USERS & AUTH
-- =========================

CREATE TABLE roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(50) UNIQUE,
  description VARCHAR(255)
);

CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  role_id BIGINT,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE refresh_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNIQUE,
  token VARCHAR(500),
  expiry_date TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =========================
-- DRIVER LICENSE (SELF-DRIVE)
-- =========================

CREATE TABLE driver_licenses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNIQUE,
  license_type VARCHAR(50),
  license_number VARCHAR(50),
  date_of_birth DATE,
  front_image_url VARCHAR(500),
  status_id TINYINT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (status_id) REFERENCES license_statuses(id)
);

-- =========================
-- DRIVERS (WITH-DRIVER)
-- =========================

CREATE TABLE drivers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100),
  phone VARCHAR(20),
  status_id TINYINT,
  FOREIGN KEY (status_id) REFERENCES driver_statuses(id)
);

-- =========================
-- SERVICE PRICING
-- =========================

CREATE TABLE driver_pricing (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  daily_fee DECIMAL(10,2),
  effective_from DATE,
  effective_to DATE,
  is_active BOOLEAN
);

CREATE TABLE delivery_pricing (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  base_fee DECIMAL(10,2),
  effective_from DATE,
  effective_to DATE,
  is_active BOOLEAN
);

-- =========================
-- BOOKINGS
-- =========================

CREATE TABLE bookings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_code VARCHAR(20) UNIQUE,
  vehicle_id BIGINT,
  user_id BIGINT,
  rental_type_id TINYINT,
  pickup_method_id TINYINT,
  driver_id BIGINT,
  customer_name VARCHAR(100),
  customer_email VARCHAR(100),
  start_date DATE,
  end_date DATE,
  daily_rate DECIMAL(10,2),
  rental_fee DECIMAL(12,2),
  driver_fee DECIMAL(12,2),
  delivery_fee DECIMAL(12,2),
  total_amount DECIMAL(12,2),
  status_id TINYINT,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (rental_type_id) REFERENCES rental_types(id),
  FOREIGN KEY (pickup_method_id) REFERENCES pickup_methods(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  FOREIGN KEY (status_id) REFERENCES booking_statuses(id)
);

-- =========================
-- HANDOVER & INSPECTION
-- =========================

CREATE TABLE handover_records (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT UNIQUE,
  battery_level INT,
  odometer INT,
  exterior_condition_id TINYINT,
  interior_condition_id TINYINT,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (exterior_condition_id) REFERENCES condition_types(id),
  FOREIGN KEY (interior_condition_id) REFERENCES condition_types(id)
);

CREATE TABLE inspections (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT UNIQUE,
  battery_level INT,
  odometer INT,
  exterior_condition_id TINYINT,
  interior_condition_id TINYINT,
  has_damage BOOLEAN,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (exterior_condition_id) REFERENCES condition_types(id),
  FOREIGN KEY (interior_condition_id) REFERENCES condition_types(id)
);

-- =========================
-- INVOICE & PAYMENTS
-- =========================

CREATE TABLE invoices (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(30) UNIQUE,
  booking_id BIGINT UNIQUE,
  rental_fee DECIMAL(12,2),
  driver_fee DECIMAL(12,2),
  delivery_fee DECIMAL(12,2),
  damage_fee DECIMAL(10,2),
  total_amount DECIMAL(12,2),
  payment_status_id TINYINT,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (payment_status_id) REFERENCES invoice_payment_statuses(id)
);

CREATE TABLE payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  invoice_id BIGINT,
  amount DECIMAL(12,2),
  payment_method_id TINYINT,
  payment_status_id TINYINT,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),
  FOREIGN KEY (payment_status_id) REFERENCES payment_statuses(id)
);

-- =========================
-- GPS TRACKING (REAL-TIME)
-- =========================

CREATE TABLE vehicle_locations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id BIGINT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

CREATE TABLE vehicle_last_location (
  vehicle_id BIGINT PRIMARY KEY,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  recorded_at TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- =========================
-- INITIAL DATA
-- =========================

INSERT INTO vehicle_statuses VALUES
(1,'AVAILABLE','Available'),
(2,'RENTED','Rented');

INSERT INTO booking_statuses VALUES
(1,'PENDING','Pending'),
(2,'CONFIRMED','Confirmed'),
(3,'IN_PROGRESS','In Progress'),
(4,'COMPLETED','Completed'),
(5,'CANCELLED','Cancelled');

INSERT INTO condition_types VALUES
(1,'GOOD','Good'),
(2,'DAMAGED','Damaged');

INSERT INTO invoice_payment_statuses VALUES
(1,'PENDING','Pending'),
(2,'PAID','Paid');

INSERT INTO payment_statuses VALUES
(1,'SUCCESS','Success'),
(2,'FAILED','Failed');

INSERT INTO payment_methods VALUES
(1,'CASH','Cash'),
(2,'MOMO','MoMo'),
(3,'VNPAY','VNPay');

INSERT INTO driver_statuses VALUES
(1,'AVAILABLE','Available'),
(2,'BUSY','Busy');

INSERT INTO rental_types VALUES
(1,'SELF_DRIVE','Self Drive'),
(2,'WITH_DRIVER','With Driver');

INSERT INTO pickup_methods VALUES
(1,'STORE','Store Pickup'),
(2,'DELIVERY','Delivery');

INSERT INTO license_statuses VALUES
(1,'PENDING','Pending'),
(2,'APPROVED','Approved'),
(3,'REJECTED','Rejected');

INSERT INTO roles (role_name, description) VALUES
('ROLE_CUSTOMER','Customer'),
('ROLE_STAFF','Staff'),
('ROLE_OPERATOR','Operator'),
('ROLE_ADMIN','Admin');

SET FOREIGN_KEY_CHECKS = 1;
