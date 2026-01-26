SET FOREIGN_KEY_CHECKS = 0;

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
DROP TABLE IF EXISTS pickup_methods;
DROP TABLE IF EXISTS rental_types;
DROP TABLE IF EXISTS payment_methods;
DROP TABLE IF EXISTS booking_statuses;
DROP TABLE IF EXISTS condition_types;
DROP TABLE IF EXISTS invoice_payment_statuses;
DROP TABLE IF EXISTS payment_statuses;
DROP TABLE IF EXISTS driver_statuses;
DROP TABLE IF EXISTS license_statuses;
DROP TABLE IF EXISTS vehicle_statuses;
DROP TABLE IF EXISTS vehicle_last_location;

SET FOREIGN_KEY_CHECKS = 1;


-- Lookup / danh m?c
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

CREATE TABLE roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(50) UNIQUE,
  description VARCHAR(255)
);

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
  monthly_price DECIMAL(12,2),
  overtime_fee_per_hour DECIMAL(8,2),
  effective_from DATE,
  effective_to DATE,
  is_active BOOLEAN,
  FOREIGN KEY (vehicle_category_id) REFERENCES vehicle_categories(id)
);

-- Core
CREATE TABLE vehicles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  model VARCHAR(100),
  brand VARCHAR(50),
  license_plate VARCHAR(20) UNIQUE,
  daily_rate DECIMAL(10,2),
  status VARCHAR(30),
  category_id BIGINT,
  image_url VARCHAR(500),
  battery_capacity_kwh DECIMAL(5,2),
  range_km INT,
  charging_time_hours DECIMAL(4,2),
  seats INT,
  description TEXT,
  FOREIGN KEY (category_id) REFERENCES vehicle_categories(id)
);

CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  role_id BIGINT,
  license_type VARCHAR(50),
  license_number VARCHAR(50),
  date_of_birth DATE,
  license_front_image_url VARCHAR(500),
  license_status VARCHAR(30),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE refresh_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNIQUE,
  token VARCHAR(500),
  expiry_date TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- D?ch v? tài x? / giao xe
CREATE TABLE drivers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100),
  phone VARCHAR(20),
  status VARCHAR(30)
);

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

-- Booking
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
  status VARCHAR(30),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (rental_type_id) REFERENCES rental_types(id),
  FOREIGN KEY (pickup_method_id) REFERENCES pickup_methods(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- Handover & Inspection
CREATE TABLE handover_records (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT UNIQUE,
  battery_level INT,
  odometer INT,
  exterior_condition VARCHAR(30),
  interior_condition VARCHAR(30),
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE TABLE inspections (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT UNIQUE,
  battery_level INT,
  odometer INT,
  exterior_condition VARCHAR(30),
  interior_condition VARCHAR(30),
  has_damage BOOLEAN,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Invoice & Payment
CREATE TABLE invoices (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(30) UNIQUE,
  booking_id BIGINT UNIQUE,
  rental_fee DECIMAL(12,2),
  driver_fee DECIMAL(12,2),
  delivery_fee DECIMAL(12,2),
  damage_fee DECIMAL(10,2),
  total_amount DECIMAL(12,2),
  payment_status VARCHAR(30),
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE INDEX idx_invoice_payment_status ON invoices(payment_status);

CREATE TABLE payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  invoice_id BIGINT,
  amount DECIMAL(12,2),
  payment_method_id TINYINT,
  payment_status VARCHAR(30),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
);

-- GPS
CREATE TABLE vehicle_locations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id BIGINT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- Seed data
INSERT INTO payment_methods VALUES
(1,'CASH','Cash'),
(2,'MOMO','MoMo'),
(3,'VNPAY','VNPay');

INSERT INTO rental_types VALUES
(1,'SELF_DRIVE','Self Drive'),
(2,'WITH_DRIVER','With Driver');

INSERT INTO pickup_methods VALUES
(1,'STORE','Store Pickup'),
(2,'DELIVERY','Delivery');

INSERT INTO roles (role_name, description) VALUES
('ROLE_CUSTOMER','Customer'),
('ROLE_STAFF','Staff'),
('ROLE_OPERATOR','Operator'),
('ROLE_ADMIN','Admin');

INSERT INTO vehicle_categories (name, description) VALUES
('ECONOMY', 'Budget-friendly electric vehicles for everyday use'),
('STANDARD', 'Mid-range vehicles with balanced features'),
('PREMIUM', 'High-performance electric vehicles'),
('LUXURY', 'Top-tier luxury electric vehicles'),
('SUV', 'Spacious SUVs for family trips'),
('COMPACT', 'Small cars ideal for city driving');

INSERT INTO pricing (vehicle_category_id, daily_price, weekly_price, monthly_price, overtime_fee_per_hour, effective_from, effective_to, is_active) VALUES
(1, 1250000, 7500000, 25000000, 125000, '2024-01-01', NULL, TRUE),
(2, 2000000, 12500000, 45000000, 200000, '2024-01-01', NULL, TRUE),
(3, 3000000, 18750000, 70000000, 300000, '2024-01-01', NULL, TRUE),
(4, 5000000, 30000000, 112500000, 500000, '2024-01-01', NULL, TRUE),
(5, 2500000, 15000000, 55000000, 250000, '2024-01-01', NULL, TRUE),
(6, 1125000, 6750000, 22500000, 112500, '2024-01-01', NULL, TRUE);

INSERT INTO vehicles (name, model, brand, license_plate, daily_rate, status, category_id) VALUES
-- Tesla
('Tesla Model 3 Standard', 'Model 3', 'Tesla', '30A-12345', 2125000, 'AVAILABLE', 3),
('Tesla Model 3 Long Range', 'Model 3 LR', 'Tesla', '30A-12346', 2375000, 'AVAILABLE', 3),
('Tesla Model Y', 'Model Y', 'Tesla', '30A-12347', 2750000, 'AVAILABLE', 5),
('Tesla Model S Plaid', 'Model S', 'Tesla', '30A-12348', 5000000, 'RENTED', 4),
('Tesla Model X', 'Model X', 'Tesla', '30A-12349', 4500000, 'AVAILABLE', 4),

-- VinFast
('VinFast VF e34', 'VF e34', 'VinFast', '29A-11111', 1375000, 'AVAILABLE', 2),
('VinFast VF 8', 'VF 8', 'VinFast', '29A-11112', 2250000, 'AVAILABLE', 5),
('VinFast VF 9', 'VF 9', 'VinFast', '29A-11113', 3750000, 'AVAILABLE', 4),
('VinFast VF 5', 'VF 5', 'VinFast', '29A-11114', 1125000, 'AVAILABLE', 6),
('VinFast VF 6', 'VF 6', 'VinFast', '29A-11115', 1625000, 'RENTED', 2),

-- BYD
('BYD Dolphin', 'Dolphin', 'BYD', '51A-22221', 1200000, 'AVAILABLE', 1),
('BYD Atto 3', 'Atto 3', 'BYD', '51A-22222', 1750000, 'AVAILABLE', 2),
('BYD Seal', 'Seal', 'BYD', '51A-22223', 2500000, 'AVAILABLE', 3),
('BYD Tang EV', 'Tang EV', 'BYD', '51A-22224', 3250000, 'AVAILABLE', 5),
('BYD Han EV', 'Han EV', 'BYD', '51A-22225', 2875000, 'RENTED', 4),

-- Hyundai
('Hyundai Ioniq 5', 'Ioniq 5', 'Hyundai', '43A-33331', 2250000, 'AVAILABLE', 3),
('Hyundai Ioniq 6', 'Ioniq 6', 'Hyundai', '43A-33332', 2375000, 'AVAILABLE', 3),
('Hyundai Kona Electric', 'Kona EV', 'Hyundai', '43A-33333', 1500000, 'AVAILABLE', 6),

-- Kia
('Kia EV6', 'EV6', 'Kia', '92A-44441', 2375000, 'AVAILABLE', 3),
('Kia EV9', 'EV9', 'Kia', '92A-44442', 3500000, 'AVAILABLE', 5),
('Kia Niro EV', 'Niro EV', 'Kia', '92A-44443', 1625000, 'RENTED', 2),

-- Mercedes
('Mercedes EQS 450+', 'EQS', 'Mercedes', '30A-55551', 5500000, 'AVAILABLE', 4),
('Mercedes EQE SUV', 'EQE SUV', 'Mercedes', '30A-55552', 4500000, 'AVAILABLE', 4),

-- BMW
('BMW i4 eDrive40', 'i4', 'BMW', '30A-66661', 3250000, 'AVAILABLE', 3),
('BMW iX xDrive50', 'iX', 'BMW', '30A-66662', 4750000, 'AVAILABLE', 4),

-- Audi
('Audi Q4 e-tron', 'Q4 e-tron', 'Audi', '30A-77771', 2750000, 'AVAILABLE', 5),
('Audi e-tron GT', 'e-tron GT', 'Audi', '30A-77772', 5000000, 'AVAILABLE', 4),

-- Porsche
('Porsche Taycan 4S', 'Taycan', 'Porsche', '30A-88881', 6250000, 'AVAILABLE', 4),

-- MG
('MG ZS EV', 'ZS EV', 'MG', '36A-99991', 1250000, 'AVAILABLE', 1),
('MG MG4', 'MG4', 'MG', '36A-99992', 1375000, 'AVAILABLE', 2);

-- Re-apply image urls
UPDATE vehicles SET image_url = 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800' WHERE brand = 'Tesla';
UPDATE vehicles SET image_url = 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800' WHERE brand = 'VinFast';
UPDATE vehicles SET image_url = 'https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&q=80&w=800' WHERE brand = 'BMW';
UPDATE vehicles SET image_url = 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800' WHERE brand = 'Mercedes';
UPDATE vehicles SET image_url = 'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&q=80&w=800' WHERE brand = 'Porsche';
UPDATE vehicles SET image_url = 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=800' WHERE brand = 'Hyundai' OR brand = 'Kia';
UPDATE vehicles SET image_url = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800' WHERE image_url IS NULL;


INSERT INTO users (full_name, email, password, role_id) VALUES
-- Admin
('Nguy?n Vãn Admin', 'admin@carrentalsystem.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 4),

-- Staff
('Tr?n Th? Staff', 'staff@carrentalsystem.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 2),
('Lê Vãn Operator', 'operator@carrentalsystem.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 3),

-- Customers
('Ph?m Ng?c Minh', 'minhpn@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1),
('Hoàng Th? Lan', 'lanhth@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1),
('V? Ð?c Anh', 'anhvd@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1),
('Nguy?n Mai Hýõng', 'huongnm@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1),
('Tr?n Qu?c B?o', 'baotq@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1),
('Lê Th? Kim Chi', 'chiltk@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1),
('Ð?ng Vãn Tùng', 'tungdv@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJL0LBVK', 1),
('Bùi Th? Phýõng', 'phuongbt@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJL0LBVK', 1),
('Ngô H?u Nam', 'namnh@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJL0LBVK', 1),
('H? Minh Tu?n', 'tuanhm@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJL0LBVK', 1),
('Dýõng Th? Thu', 'thudt@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJL0LBVK', 1),
('Phan Vãn Ð?c', 'ducpv@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJL0LBVK', 1),
('L? Th? H?ng', 'honglth@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJL0LBVK', 1),
('Châu Vãn Long', 'longcv@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJL0LBVK', 1),
('Mai Th? Ng?c', 'ngocmt@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJL0LBVK', 1),
('Ðinh Công Thành', 'thanhdc@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJL0LBVK', 1),
('V? Th? Lan Anh', 'anhvtl@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJL0LBVK', 1);

-- Driver license data merged into users
UPDATE users SET license_type = 'B2', license_number = 'DL-2024-001234', date_of_birth = '1990-05-15', license_front_image_url = '/uploads/licenses/license_001.jpg', license_status = 'APPROVED' WHERE id = 4;
UPDATE users SET license_type = 'B2', license_number = 'DL-2024-001235', date_of_birth = '1988-08-20', license_front_image_url = '/uploads/licenses/license_002.jpg', license_status = 'APPROVED' WHERE id = 5;
UPDATE users SET license_type = 'B1', license_number = 'DL-2024-001236', date_of_birth = '1995-03-10', license_front_image_url = '/uploads/licenses/license_003.jpg', license_status = 'APPROVED' WHERE id = 6;
UPDATE users SET license_type = 'B2', license_number = 'DL-2024-001237', date_of_birth = '1992-11-25', license_front_image_url = '/uploads/licenses/license_004.jpg', license_status = 'PENDING' WHERE id = 7;
UPDATE users SET license_type = 'B2', license_number = 'DL-2024-001238', date_of_birth = '1985-07-30', license_front_image_url = '/uploads/licenses/license_005.jpg', license_status = 'APPROVED' WHERE id = 8;
UPDATE users SET license_type = 'C',  license_number = 'DL-2024-001239', date_of_birth = '1987-02-14', license_front_image_url = '/uploads/licenses/license_006.jpg', license_status = 'APPROVED' WHERE id = 9;
UPDATE users SET license_type = 'B2', license_number = 'DL-2024-001240', date_of_birth = '1993-06-08', license_front_image_url = '/uploads/licenses/license_007.jpg', license_status = 'REJECTED' WHERE id = 10;
UPDATE users SET license_type = 'B1', license_number = 'DL-2024-001241', date_of_birth = '1998-12-01', license_front_image_url = '/uploads/licenses/license_008.jpg', license_status = 'APPROVED' WHERE id = 11;
UPDATE users SET license_type = 'B2', license_number = 'DL-2024-001242', date_of_birth = '1991-09-18', license_front_image_url = '/uploads/licenses/license_009.jpg', license_status = 'APPROVED' WHERE id = 12;
UPDATE users SET license_type = 'B2', license_number = 'DL-2024-001243', date_of_birth = '1989-04-22', license_front_image_url = '/uploads/licenses/license_010.jpg', license_status = 'PENDING' WHERE id = 13;

INSERT INTO drivers (full_name, phone, status) VALUES
('Nguy?n Vãn Tài', '0901234567', 'AVAILABLE'),
('Tr?n Minh Hoàng', '0912345678', 'AVAILABLE'),
('Lê Thành Long', '0923456789', 'AVAILABLE'),
('Ph?m Ð?c Trung', '0934567890', 'BUSY'),
('Hoàng Vãn Phúc', '0945678901', 'AVAILABLE'),
('V? Thanh H?i', '0956789012', 'AVAILABLE'),
('Ð? Quang Vinh', '0967890123', 'BUSY'),
('Bùi Minh Khoa', '0978901234', 'AVAILABLE'),
('Ngô Vãn Sõn', '0989012345', 'AVAILABLE'),
('Ðinh Qu?c Khánh', '0990123456', 'AVAILABLE');

INSERT INTO driver_pricing (daily_fee, effective_from, effective_to, is_active) VALUES
(30.00, '2024-01-01', NULL, TRUE),
(35.00, '2024-06-01', NULL, FALSE);

INSERT INTO delivery_pricing (base_fee, effective_from, effective_to, is_active) VALUES
(15.00, '2024-01-01', NULL, TRUE),
(20.00, '2024-06-01', NULL, FALSE);

INSERT INTO bookings (booking_code, vehicle_id, user_id, rental_type_id, pickup_method_id, driver_id, customer_name, customer_email, start_date, end_date, daily_rate, rental_fee, driver_fee, delivery_fee, total_amount, status) VALUES
-- COMPLETED bookings (10)
('BK-2025-0001', 1, 4, 1, 1, NULL, 'Ph?m Ng?c Minh', 'minhpn@gmail.com', '2025-01-05', '2025-01-08', 85.00, 255.00, 0.00, 0.00, 255.00, 'COMPLETED'),
('BK-2025-0002', 6, 5, 1, 2, NULL, 'Hoàng Th? Lan', 'lanhth@gmail.com', '2025-01-06', '2025-01-10', 55.00, 220.00, 0.00, 15.00, 235.00, 'COMPLETED'),
('BK-2025-0003', 11, 6, 2, 1, 1, 'V? Ð?c Anh', 'anhvd@gmail.com', '2025-01-07', '2025-01-09', 48.00, 96.00, 60.00, 0.00, 156.00, 'COMPLETED'),
('BK-2025-0004', 16, 7, 1, 1, NULL, 'Nguy?n Mai Hýõng', 'huongnm@gmail.com', '2025-01-08', '2025-01-12', 90.00, 360.00, 0.00, 0.00, 360.00, 'COMPLETED'),
('BK-2025-0005', 3, 8, 2, 2, 2, 'Tr?n Qu?c B?o', 'baotq@gmail.com', '2025-01-09', '2025-01-11', 110.00, 220.00, 60.00, 15.00, 295.00, 'COMPLETED'),
('BK-2025-0006', 12, 9, 1, 1, NULL, 'Lê Th? Kim Chi', 'chiltk@gmail.com', '2025-01-10', '2025-01-15', 70.00, 350.00, 0.00, 0.00, 350.00, 'COMPLETED'),
('BK-2025-0007', 19, 10, 2, 1, 3, 'Ð?ng Vãn Tùng', 'tungdv@gmail.com', '2025-01-11', '2025-01-13', 95.00, 190.00, 60.00, 0.00, 250.00, 'COMPLETED'),
('BK-2025-0008', 24, 11, 1, 2, NULL, 'Bùi Th? Phýõng', 'phuongbt@gmail.com', '2025-01-12', '2025-01-14', 130.00, 260.00, 0.00, 15.00, 275.00, 'COMPLETED'),
('BK-2025-0009', 29, 12, 1, 1, NULL, 'Ngô H?u Nam', 'namnh@gmail.com', '2025-01-13', '2025-01-16', 50.00, 150.00, 0.00, 0.00, 150.00, 'COMPLETED'),
('BK-2025-0010', 2, 13, 2, 2, 5, 'H? Minh Tu?n', 'tuanhm@gmail.com', '2025-01-14', '2025-01-17', 95.00, 285.00, 90.00, 15.00, 390.00, 'COMPLETED'),

-- IN_PROGRESS bookings (4)
('BK-2025-0011', 4, 14, 1, 1, NULL, 'Dýõng Th? Thu', 'thudt@gmail.com', '2025-01-20', '2025-01-28', 200.00, 1600.00, 0.00, 0.00, 1600.00, 'IN_PROGRESS'),
('BK-2025-0012', 10, 15, 2, 1, 4, 'Phan Vãn Ð?c', 'ducpv@gmail.com', '2025-01-22', '2025-01-29', 65.00, 455.00, 210.00, 0.00, 665.00, 'IN_PROGRESS'),
('BK-2025-0013', 15, 16, 1, 2, NULL, 'L? Th? H?ng', 'honglth@gmail.com', '2025-01-23', '2025-01-30', 115.00, 805.00, 0.00, 15.00, 820.00, 'IN_PROGRESS'),
('BK-2025-0014', 21, 17, 2, 1, 7, 'Châu Vãn Long', 'longcv@gmail.com', '2025-01-24', '2025-01-31', 65.00, 455.00, 210.00, 0.00, 665.00, 'IN_PROGRESS'),

-- CONFIRMED bookings (5)
('BK-2025-0015', 5, 18, 1, 1, NULL, 'Mai Th? Ng?c', 'ngocmt@gmail.com', '2025-01-28', '2025-02-02', 180.00, 900.00, 0.00, 0.00, 900.00, 'CONFIRMED'),
('BK-2025-0016', 7, 19, 2, 2, 8, 'Ðinh Công Thành', 'thanhdc@gmail.com', '2025-01-29', '2025-02-03', 90.00, 450.00, 150.00, 15.00, 615.00, 'CONFIRMED'),
('BK-2025-0017', 13, 20, 1, 1, NULL, 'V? Th? Lan Anh', 'anhvtl@gmail.com', '2025-01-30', '2025-02-05', 100.00, 600.00, 0.00, 0.00, 600.00, 'CONFIRMED'),
('BK-2025-0018', 17, 4, 1, 2, NULL, 'Ph?m Ng?c Minh', 'minhpn@gmail.com', '2025-02-01', '2025-02-07', 95.00, 570.00, 0.00, 15.00, 585.00, 'CONFIRMED'),
('BK-2025-0019', 22, 5, 2, 1, 9, 'Hoàng Th? Lan', 'lanhth@gmail.com', '2025-02-02', '2025-02-10', 180.00, 1440.00, 240.00, 0.00, 1680.00, 'CONFIRMED'),

-- PENDING bookings (3)
('BK-2025-0020', 25, 6, 1, 1, NULL, 'V? Ð?c Anh', 'anhvd@gmail.com', '2025-02-05', '2025-02-10', 190.00, 950.00, 0.00, 0.00, 950.00, 'PENDING'),
('BK-2025-0021', 26, 7, 2, 2, 10, 'Nguy?n Mai Hýõng', 'huongnm@gmail.com', '2025-02-08', '2025-02-15', 110.00, 770.00, 210.00, 15.00, 995.00, 'PENDING'),
('BK-2025-0022', 28, 8, 1, 1, NULL, 'Tr?n Qu?c B?o', 'baotq@gmail.com', '2025-02-10', '2025-02-14', 250.00, 1000.00, 0.00, 0.00, 1000.00, 'PENDING'),

-- CANCELLED bookings (2)
('BK-2025-0023', 18, 9, 1, 1, NULL, 'Lê Th? Kim Chi', 'chiltk@gmail.com', '2025-01-18', '2025-01-22', 60.00, 240.00, 0.00, 0.00, 240.00, 'CANCELLED'),
('BK-2025-0024', 20, 10, 2, 2, 6, 'Ð?ng Vãn Tùng', 'tungdv@gmail.com', '2025-01-19', '2025-01-25', 140.00, 840.00, 180.00, 15.00, 1035.00, 'CANCELLED');

INSERT INTO handover_records (booking_id, battery_level, odometer, exterior_condition, interior_condition) VALUES
(1, 100, 15420, 'GOOD', 'GOOD'),
(2, 95, 8750, 'GOOD', 'GOOD'),
(3, 100, 22100, 'GOOD', 'GOOD'),
(4, 98, 31200, 'GOOD', 'GOOD'),
(5, 100, 5600, 'GOOD', 'GOOD'),
(6, 92, 18900, 'GOOD', 'GOOD'),
(7, 100, 12350, 'GOOD', 'GOOD'),
(8, 96, 27800, 'GOOD', 'GOOD'),
(9, 100, 3200, 'GOOD', 'GOOD'),
(10, 94, 16700, 'GOOD', 'GOOD'),
(11, 100, 45200, 'GOOD', 'GOOD'),
(12, 97, 9100, 'GOOD', 'GOOD'),
(13, 100, 38500, 'GOOD', 'GOOD'),
(14, 95, 7800, 'GOOD', 'GOOD');

INSERT INTO inspections (booking_id, battery_level, odometer, exterior_condition, interior_condition, has_damage) VALUES
(1, 35, 15850, 'GOOD', 'GOOD', FALSE),
(2, 42, 9180, 'GOOD', 'GOOD', FALSE),
(3, 28, 22450, 'GOOD', 'GOOD', FALSE),
(4, 55, 31720, 'GOOD', 'GOOD', FALSE),
(5, 18, 5920, 'GOOD', 'DAMAGED', TRUE),
(6, 40, 19430, 'GOOD', 'GOOD', FALSE),
(7, 62, 12680, 'GOOD', 'GOOD', FALSE),
(8, 30, 28150, 'GOOD', 'GOOD', FALSE),
(9, 75, 3510, 'GOOD', 'GOOD', FALSE),
(10, 25, 17180, 'DAMAGED', 'GOOD', TRUE);

INSERT INTO invoices (invoice_number, booking_id, rental_fee, driver_fee, delivery_fee, damage_fee, total_amount, payment_status) VALUES
('INV-2025-0001', 1, 255.00, 0.00, 0.00, 0.00, 255.00, 'PAID'),
('INV-2025-0002', 2, 220.00, 0.00, 15.00, 0.00, 235.00, 'PAID'),
('INV-2025-0003', 3, 96.00, 60.00, 0.00, 0.00, 156.00, 'PAID'),
('INV-2025-0004', 4, 360.00, 0.00, 0.00, 0.00, 360.00, 'PAID'),
('INV-2025-0005', 5, 220.00, 60.00, 15.00, 50.00, 345.00, 'PAID'),
('INV-2025-0006', 6, 350.00, 0.00, 0.00, 0.00, 350.00, 'PAID'),
('INV-2025-0007', 7, 190.00, 60.00, 0.00, 0.00, 250.00, 'PAID'),
('INV-2025-0008', 8, 260.00, 0.00, 15.00, 0.00, 275.00, 'PAID'),
('INV-2025-0009', 9, 150.00, 0.00, 0.00, 0.00, 150.00, 'PAID'),
('INV-2025-0010', 10, 285.00, 90.00, 15.00, 100.00, 490.00, 'PAID');

INSERT INTO payments (invoice_id, amount, payment_method_id, payment_status) VALUES
(1, 255.00, 1, 'SUCCESS'),
(2, 235.00, 2, 'SUCCESS'),
(3, 156.00, 3, 'SUCCESS'),
(4, 360.00, 1, 'SUCCESS'),
(5, 345.00, 2, 'SUCCESS'),
(6, 350.00, 3, 'SUCCESS'),
(7, 250.00, 1, 'SUCCESS'),
(8, 275.00, 2, 'SUCCESS'),
(9, 150.00, 1, 'SUCCESS'),
(10, 490.00, 3, 'SUCCESS');

INSERT INTO vehicle_locations (vehicle_id, latitude, longitude, recorded_at) VALUES
(1, 21.0285000, 105.8542000, NOW()),
(2, 21.0355000, 105.8480000, NOW()),
(3, 10.7769000, 106.7009000, NOW()),
(4, 10.7820000, 106.6950000, NOW()),
(5, 16.0544000, 108.2022000, NOW()),
(6, 21.0120000, 105.8200000, NOW()),
(7, 21.0450000, 105.8100000, NOW()),
(8, 10.8000000, 106.6700000, NOW()),
(9, 21.0300000, 105.8400000, NOW()),
(10, 10.7900000, 106.6800000, NOW()),
(1, 21.0285000, 105.8542000, '2025-01-26 08:00:00'),
(1, 21.0300000, 105.8500000, '2025-01-26 09:00:00'),
(1, 21.0320000, 105.8460000, '2025-01-26 10:00:00'),
(2, 21.0355000, 105.8480000, '2025-01-26 08:00:00'),
(2, 21.0370000, 105.8450000, '2025-01-26 09:00:00'),
(3, 10.7769000, 106.7009000, '2025-01-26 08:00:00'),
(3, 10.7800000, 106.6950000, '2025-01-26 09:00:00'),
(3, 10.7850000, 106.6900000, '2025-01-26 10:00:00');
