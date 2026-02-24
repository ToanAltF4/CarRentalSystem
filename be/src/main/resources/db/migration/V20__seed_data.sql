-- =========================================================
-- SEED DATA FOR V19 SCHEMA
-- EV Car Rental System - Mock data
-- =========================================================

-- =========================
-- LOOKUP TABLES
-- =========================

INSERT INTO payment_methods (id, code, name) VALUES
(1, 'CASH', 'Cash'),
(2, 'MOMO', 'MoMo'),
(3, 'VNPAY', 'VNPay');

INSERT INTO rental_types (id, code, name) VALUES
(1, 'SELF_DRIVE', 'Self Drive'),
(2, 'WITH_DRIVER', 'With Driver');

INSERT INTO pickup_methods (id, code, name) VALUES
(1, 'STORE', 'Store Pickup'),
(2, 'DELIVERY', 'Delivery');

-- =========================
-- ROLES
-- =========================

INSERT INTO roles (id, role_name, description) VALUES
(1, 'ROLE_CUSTOMER', 'Regular customers who rent vehicles'),
(2, 'ROLE_STAFF', 'Staff members for vehicle and booking management'),
(3, 'ROLE_OPERATOR', 'Operator for booking operations'),
(4, 'ROLE_ADMIN', 'System administrators with full access'),
(5, 'ROLE_DRIVER', 'Chauffeur/Driver for vehicle rentals');

-- =========================
-- VEHICLE CATEGORIES (brand | name | model)
-- =========================

INSERT INTO vehicle_categories (id, brand, name, model, seats, battery_capacity_kwh, range_km, charging_time_hours, description) VALUES
(1, 'Tesla', 'Model 3', 'Standard Range', 5, 60.0, 438, 6.5, 'Budget-friendly electric sedan'),
(2, 'Tesla', 'Model 3', 'Long Range', 5, 75.0, 568, 8.0, 'Extended range Model 3'),
(3, 'Tesla', 'Model Y', 'Long Range', 5, 75.0, 533, 8.0, 'SUV electric vehicle'),
(4, 'Tesla', 'Model S', 'Plaid', 5, 100.0, 637, 12.0, 'High-performance sedan'),
(5, 'VinFast', 'VF 8', 'Standard', 5, 87.7, 420, 10.0, 'VinFast midsize SUV'),
(6, 'VinFast', 'VF 9', 'Eco', 7, 123.0, 438, 12.0, 'VinFast large SUV'),
(7, 'VinFast', 'VF 5', 'Standard', 5, 49.9, 300, 6.5, 'Compact city EV'),
(8, 'BYD', 'Dolphin', 'Standard', 5, 60.5, 427, 6.5, 'Budget-friendly hatchback'),
(9, 'BYD', 'Atto 3', 'Extended Range', 5, 60.5, 420, 6.5, 'Crossover SUV'),
(10, 'BYD', 'Seal', 'Premium', 5, 82.5, 570, 8.0, 'Luxury sedan'),
(11, 'Hyundai', 'Ioniq 5', 'Long Range', 5, 77.4, 458, 8.0, 'Modern crossover'),
(12, 'Kia', 'EV6', 'GT-Line', 5, 77.4, 528, 8.0, 'Sporty electric crossover');

-- =========================
-- VEHICLE CATEGORY IMAGES
-- =========================

INSERT INTO vehicle_category_images (vehicle_category_id, image_url, is_primary, sort_order) VALUES
(1, 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800', 1, 0),
(2, 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800', 1, 0),
(3, 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800', 1, 0),
(4, 'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&q=80&w=800', 1, 0),
(5, 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800', 1, 0),
(6, 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800', 1, 0),
(7, 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800', 1, 0),
(8, 'https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&q=80&w=800', 1, 0),
(9, 'https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&q=80&w=800', 1, 0),
(10, 'https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&q=80&w=800', 1, 0),
(11, 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=800', 1, 0),
(12, 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=800', 1, 0);

-- =========================
-- PRICING (VND)
-- =========================

INSERT INTO pricing (vehicle_category_id, daily_price, weekly_price, monthly_price, overtime_fee_per_hour, effective_from, effective_to, is_active) VALUES
(1, 1250000, 7500000, 25000000, 125000, '2024-01-01', NULL, 1),
(2, 2000000, 12500000, 45000000, 200000, '2024-01-01', NULL, 1),
(3, 2500000, 15000000, 55000000, 250000, '2024-01-01', NULL, 1),
(4, 5000000, 30000000, 90000000, 500000, '2024-01-01', NULL, 1),
(5, 2250000, 13500000, 50000000, 225000, '2024-01-01', NULL, 1),
(6, 3750000, 22500000, 80000000, 375000, '2024-01-01', NULL, 1),
(7, 1125000, 6750000, 22500000, 112500, '2024-01-01', NULL, 1),
(8, 1200000, 7200000, 24000000, 120000, '2024-01-01', NULL, 1),
(9, 1750000, 10500000, 38000000, 175000, '2024-01-01', NULL, 1),
(10, 2500000, 15000000, 55000000, 250000, '2024-01-01', NULL, 1),
(11, 2250000, 13500000, 50000000, 225000, '2024-01-01', NULL, 1),
(12, 2375000, 14250000, 52000000, 237500, '2024-01-01', NULL, 1);

-- =========================
-- DRIVER / DELIVERY PRICING (VND)
-- =========================

INSERT INTO driver_pricing (daily_fee, effective_from, effective_to, is_active) VALUES
(500000, '2024-01-01', NULL, 1);

INSERT INTO delivery_pricing (base_fee, effective_from, effective_to, is_active) VALUES
(150000, '2024-01-01', NULL, 1);

-- =========================
-- VEHICLES (physical cars)
-- =========================

INSERT INTO vehicles (vehicle_category_id, license_plate, status, vin, odometer, current_battery_percent) VALUES
-- Tesla
(1, '30A-12345', 'AVAILABLE', 'TSLA001', 15420, 95),
(2, '30A-12346', 'AVAILABLE', 'TSLA002', 8750, 100),
(3, '30A-12347', 'AVAILABLE', 'TSLA003', 22100, 88),
(4, '30A-12348', 'INACTIVE', 'TSLA004', 5600, 65),
-- VinFast
(5, '29A-11111', 'AVAILABLE', 'VFS001', 12000, 92),
(5, '29A-11112', 'AVAILABLE', 'VFS002', 8500, 100),
(6, '29A-11113', 'AVAILABLE', 'VFS003', 18900, 78),
(7, '29A-11114', 'AVAILABLE', 'VFS004', 6500, 100),
-- BYD
(8, '51A-22221', 'AVAILABLE', 'BYD001', 14200, 90),
(9, '51A-22222', 'INACTIVE', 'BYD002', 9800, 55),
(10, '51A-22223', 'AVAILABLE', 'BYD003', 15600, 85),
-- Hyundai, Kia
(11, '43A-33331', 'AVAILABLE', 'HYN001', 11200, 95),
(12, '92A-44441', 'AVAILABLE', 'KIA001', 13500, 88);

-- =========================
-- USERS (Admin, Staff, Operator, Drivers, Customers)
-- Password: password (bcrypt)
-- =========================

INSERT INTO users (full_name, email, password, role_id, phone, license_type, license_number, license_status, date_of_birth, status) VALUES
-- Admin (role_id=4)
('Nguyen Van Admin', 'admin@carrentalsystem.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 4, '0901000001', 'B2', 'DL-2024-001234', 'APPROVED', '1990-05-15', 'ACTIVE'),
-- Staff (role_id=2)
('Tran Thi Staff', 'staff@carrentalsystem.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 2, '0901000002', 'B2', 'DL-2024-001235', 'APPROVED', '1988-08-20', 'ACTIVE'),
-- Operator (role_id=3)
('Le Van Operator', 'operator@carrentalsystem.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 3, '0901000003', 'B2', 'DL-2024-001236', 'APPROVED', '1992-03-10', 'ACTIVE'),
-- Drivers (role_id=5)
('Nguyen Van Tai', 'driver1@carrentalsystem.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 5, '0901234567', 'B2', 'DL-2024-001237', 'APPROVED', '1985-11-25', 'ACTIVE'),
('Tran Minh Hoang', 'driver2@carrentalsystem.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 5, '0912345678', 'B2', 'DL-2024-001238', 'APPROVED', '1987-07-30', 'ACTIVE'),
-- Customers (role_id=1)
('Pham Ngoc Minh', 'minhpn@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1, '0923456789', 'B2', 'DL-2024-001239', 'APPROVED', '1995-02-14', 'ACTIVE'),
('Hoang Thi Lan', 'lanhth@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1, '0934567890', 'B1', 'DL-2024-001240', 'APPROVED', '1993-06-08', 'ACTIVE'),
('Vo Duc Anh', 'anhvd@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1, '0945678901', 'B2', 'DL-2024-001241', 'APPROVED', '1991-12-01', 'ACTIVE'),
('Nguyen Mai Huong', 'huongnm@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1, '0956789012', 'B2', 'DL-2024-001242', 'PENDING', '1994-09-18', 'ACTIVE'),
('Tran Quoc Bao', 'baotq@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1, '0967890123', 'B2', 'DL-2024-001243', 'APPROVED', '1989-04-22', 'ACTIVE');

-- =========================
-- BOOKINGS (VND amounts)
-- =========================

INSERT INTO bookings (booking_code, vehicle_id, user_id, driver_user_id, rental_type_id, pickup_method_id, customer_name, customer_email, start_date, end_date, daily_rate, rental_fee, driver_fee, delivery_fee, total_amount, status) VALUES
-- COMPLETED
('BK-2025-0001', 1, 6, NULL, 1, 1, 'Pham Ngoc Minh', 'minhpn@gmail.com', '2025-01-05', '2025-01-08', 1250000, 3750000, 0, 0, 3750000, 'COMPLETED'),
('BK-2025-0002', 5, 7, NULL, 1, 2, 'Hoang Thi Lan', 'lanhth@gmail.com', '2025-01-06', '2025-01-10', 2250000, 9000000, 0, 150000, 9150000, 'COMPLETED'),
('BK-2025-0003', 9, 8, 4, 2, 1, 'Vo Duc Anh', 'anhvd@gmail.com', '2025-01-07', '2025-01-09', 1200000, 2400000, 1000000, 0, 3400000, 'COMPLETED'),
('BK-2025-0004', 12, 9, NULL, 1, 1, 'Nguyen Mai Huong', 'huongnm@gmail.com', '2025-01-08', '2025-01-12', 2250000, 9000000, 0, 0, 9000000, 'COMPLETED'),
-- IN_PROGRESS
('BK-2025-0005', 4, 6, 5, 2, 2, 'Pham Ngoc Minh', 'minhpn@gmail.com', '2025-01-20', '2025-01-28', 5000000, 40000000, 4000000, 150000, 44150000, 'IN_PROGRESS'),
('BK-2025-0006', 11, 7, NULL, 1, 1, 'Hoang Thi Lan', 'lanhth@gmail.com', '2025-01-22', '2025-01-26', 1750000, 7000000, 0, 0, 7000000, 'IN_PROGRESS'),
-- CONFIRMED
('BK-2025-0007', 2, 10, NULL, 1, 2, 'Tran Quoc Bao', 'baotq@gmail.com', '2025-02-01', '2025-02-05', 2000000, 8000000, 0, 150000, 8150000, 'CONFIRMED'),
('BK-2025-0008', 8, 8, 4, 2, 1, 'Vo Duc Anh', 'anhvd@gmail.com', '2025-02-05', '2025-02-08', 2500000, 7500000, 1500000, 0, 9000000, 'CONFIRMED'),
-- PENDING
('BK-2025-0009', 3, 9, NULL, 1, 1, 'Nguyen Mai Huong', 'huongnm@gmail.com', '2025-02-10', '2025-02-15', 2500000, 12500000, 0, 0, 12500000, 'PENDING'),
-- CANCELLED
('BK-2025-0010', 7, 10, NULL, 1, 1, 'Tran Quoc Bao', 'baotq@gmail.com', '2025-01-18', '2025-01-22', 1125000, 4500000, 0, 0, 4500000, 'CANCELLED');

-- =========================
-- INSPECTIONS (HANDOVER / RETURN)
-- =========================

INSERT INTO inspections (booking_id, inspection_type, battery_level, odometer, charging_cable_present, exterior_condition, interior_condition, has_damage, inspected_by, inspected_at) VALUES
(1, 'HANDOVER', 100, 15420, 1, 'GOOD', 'GOOD', 0, 2, '2025-01-05 08:00:00'),
(1, 'RETURN', 35, 15850, 1, 'GOOD', 'GOOD', 0, 2, '2025-01-08 14:00:00'),
(2, 'HANDOVER', 95, 12000, 1, 'GOOD', 'GOOD', 0, 2, '2025-01-06 09:00:00'),
(2, 'RETURN', 42, 12500, 1, 'GOOD', 'GOOD', 0, 2, '2025-01-10 16:00:00'),
(3, 'HANDOVER', 100, 14200, 1, 'GOOD', 'GOOD', 0, 2, '2025-01-07 10:00:00'),
(3, 'RETURN', 28, 14600, 1, 'GOOD', 'GOOD', 0, 2, '2025-01-09 11:00:00'),
(4, 'HANDOVER', 98, 15600, 1, 'GOOD', 'GOOD', 0, 2, '2025-01-08 08:30:00'),
(4, 'RETURN', 55, 16200, 1, 'GOOD', 'GOOD', 0, 2, '2025-01-12 15:00:00'),
(5, 'HANDOVER', 100, 5600, 1, 'GOOD', 'GOOD', 0, 2, '2025-01-20 09:00:00');

-- =========================
-- INVOICES & PAYMENTS
-- =========================

INSERT INTO invoices (invoice_number, booking_id, rental_fee, driver_fee, delivery_fee, damage_fee, total_amount, payment_status) VALUES
('INV-2025-0001', 1, 3750000, 0, 0, 0, 3750000, 'PAID'),
('INV-2025-0002', 2, 9000000, 0, 150000, 0, 9150000, 'PAID'),
('INV-2025-0003', 3, 2400000, 1000000, 0, 0, 3400000, 'PAID'),
('INV-2025-0004', 4, 9000000, 0, 0, 0, 9000000, 'PAID');

INSERT INTO payments (invoice_id, amount, payment_method_id, payment_status) VALUES
(1, 3750000, 1, 'SUCCESS'),
(2, 9150000, 3, 'SUCCESS'),
(3, 3400000, 2, 'SUCCESS'),
(4, 9000000, 1, 'SUCCESS');

-- =========================
-- VEHICLE LOCATIONS (GPS sample)
-- =========================

INSERT INTO vehicle_locations (vehicle_id, latitude, longitude, recorded_at) VALUES
(1, 21.0285000, 105.8542000, '2025-01-26 08:00:00'),
(1, 21.0300000, 105.8500000, '2025-01-26 09:00:00'),
(2, 21.0355000, 105.8480000, '2025-01-26 08:00:00'),
(3, 10.7769000, 106.7009000, '2025-01-26 08:00:00'),
(4, 21.0320000, 105.8460000, '2025-01-26 10:00:00');
