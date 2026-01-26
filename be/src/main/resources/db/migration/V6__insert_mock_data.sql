-- =============================================
-- MOCK DATA FOR CAR RENTAL SYSTEM
-- =============================================

-- =========================
-- VEHICLE CATEGORIES
-- =========================
INSERT INTO vehicle_categories (name, description) VALUES
('ECONOMY', 'Budget-friendly electric vehicles for everyday use'),
('STANDARD', 'Mid-range vehicles with balanced features'),
('PREMIUM', 'High-performance electric vehicles'),
('LUXURY', 'Top-tier luxury electric vehicles'),
('SUV', 'Spacious SUVs for family trips'),
('COMPACT', 'Small cars ideal for city driving');

-- =========================
-- PRICING
-- =========================
INSERT INTO pricing (vehicle_category_id, daily_price, weekly_price, monthly_price, overtime_fee_per_hour, effective_from, effective_to, is_active) VALUES
(1, 1250000, 7500000, 25000000, 125000, '2024-01-01', NULL, TRUE),
(2, 2000000, 12500000, 45000000, 200000, '2024-01-01', NULL, TRUE),
(3, 3000000, 18750000, 70000000, 300000, '2024-01-01', NULL, TRUE),
(4, 5000000, 30000000, 112500000, 500000, '2024-01-01', NULL, TRUE),
(5, 2500000, 15000000, 55000000, 250000, '2024-01-01', NULL, TRUE),
(6, 1125000, 6750000, 22500000, 112500, '2024-01-01', NULL, TRUE);

-- =========================
-- VEHICLES (30 vehicles)
-- =========================
INSERT INTO vehicles (name, model, brand, license_plate, daily_rate, status_id, category_id) VALUES
-- Tesla
('Tesla Model 3 Standard', 'Model 3', 'Tesla', '30A-12345', 2125000, 1, 3),
('Tesla Model 3 Long Range', 'Model 3 LR', 'Tesla', '30A-12346', 2375000, 1, 3),
('Tesla Model Y', 'Model Y', 'Tesla', '30A-12347', 2750000, 1, 5),
('Tesla Model S Plaid', 'Model S', 'Tesla', '30A-12348', 5000000, 2, 4),
('Tesla Model X', 'Model X', 'Tesla', '30A-12349', 4500000, 1, 4),

-- VinFast
('VinFast VF e34', 'VF e34', 'VinFast', '29A-11111', 1375000, 1, 2),
('VinFast VF 8', 'VF 8', 'VinFast', '29A-11112', 2250000, 1, 5),
('VinFast VF 9', 'VF 9', 'VinFast', '29A-11113', 3750000, 1, 4),
('VinFast VF 5', 'VF 5', 'VinFast', '29A-11114', 1125000, 1, 6),
('VinFast VF 6', 'VF 6', 'VinFast', '29A-11115', 1625000, 2, 2),

-- BYD
('BYD Dolphin', 'Dolphin', 'BYD', '51A-22221', 1200000, 1, 1),
('BYD Atto 3', 'Atto 3', 'BYD', '51A-22222', 1750000, 1, 2),
('BYD Seal', 'Seal', 'BYD', '51A-22223', 2500000, 1, 3),
('BYD Tang EV', 'Tang EV', 'BYD', '51A-22224', 3250000, 1, 5),
('BYD Han EV', 'Han EV', 'BYD', '51A-22225', 2875000, 2, 4),

-- Hyundai
('Hyundai Ioniq 5', 'Ioniq 5', 'Hyundai', '43A-33331', 2250000, 1, 3),
('Hyundai Ioniq 6', 'Ioniq 6', 'Hyundai', '43A-33332', 2375000, 1, 3),
('Hyundai Kona Electric', 'Kona EV', 'Hyundai', '43A-33333', 1500000, 1, 6),

-- Kia
('Kia EV6', 'EV6', 'Kia', '92A-44441', 2375000, 1, 3),
('Kia EV9', 'EV9', 'Kia', '92A-44442', 3500000, 1, 5),
('Kia Niro EV', 'Niro EV', 'Kia', '92A-44443', 1625000, 2, 2),

-- Mercedes
('Mercedes EQS 450+', 'EQS', 'Mercedes', '30A-55551', 5500000, 1, 4),
('Mercedes EQE SUV', 'EQE SUV', 'Mercedes', '30A-55552', 4500000, 1, 4),

-- BMW
('BMW i4 eDrive40', 'i4', 'BMW', '30A-66661', 3250000, 1, 3),
('BMW iX xDrive50', 'iX', 'BMW', '30A-66662', 4750000, 1, 4),

-- Audi
('Audi Q4 e-tron', 'Q4 e-tron', 'Audi', '30A-77771', 2750000, 1, 5),
('Audi e-tron GT', 'e-tron GT', 'Audi', '30A-77772', 5000000, 1, 4),

-- Porsche
('Porsche Taycan 4S', 'Taycan', 'Porsche', '30A-88881', 6250000, 1, 4),

-- MG
('MG ZS EV', 'ZS EV', 'MG', '36A-99991', 1250000, 1, 1),
('MG MG4', 'MG4', 'MG', '36A-99992', 1375000, 1, 2);

-- =========================
-- USERS (20 users)
-- =========================
INSERT INTO users (full_name, email, password, role_id) VALUES
-- Admin
('Nguyễn Văn Admin', 'admin@carrentalsystem.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 4),

-- Staff
('Trần Thị Staff', 'staff@carrentalsystem.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 2),
('Lê Văn Operator', 'operator@carrentalsystem.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 3),

-- Customers
('Phạm Ngọc Minh', 'minhpn@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1),
('Hoàng Thị Lan', 'lanhth@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1),
('Vũ Đức Anh', 'anhvd@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1),
('Nguyễn Mai Hương', 'huongnm@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1),
('Trần Quốc Bảo', 'baotq@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1),
('Lê Thị Kim Chi', 'chiltk@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1),
('Đặng Văn Tùng', 'tungdv@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1),
('Bùi Thị Phương', 'phuongbt@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1),
('Ngô Hữu Nam', 'namnh@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1),
('Hồ Minh Tuấn', 'tuanhm@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1),
('Dương Thị Thu', 'thudt@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1),
('Phan Văn Đức', 'ducpv@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1),
('Lý Thị Hồng', 'honglth@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1),
('Châu Văn Long', 'longcv@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1),
('Mai Thị Ngọc', 'ngocmt@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1),
('Đinh Công Thành', 'thanhdc@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1),
('Võ Thị Lan Anh', 'anhvtl@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV9pVjCjZ9uFzOv9k4jWJJLJ0LBVK', 1);

-- =========================
-- DRIVER LICENSES
-- =========================
INSERT INTO driver_licenses (user_id, license_type, license_number, date_of_birth, front_image_url, status_id) VALUES
(4, 'B2', 'DL-2024-001234', '1990-05-15', '/uploads/licenses/license_001.jpg', 2),
(5, 'B2', 'DL-2024-001235', '1988-08-20', '/uploads/licenses/license_002.jpg', 2),
(6, 'B1', 'DL-2024-001236', '1995-03-10', '/uploads/licenses/license_003.jpg', 2),
(7, 'B2', 'DL-2024-001237', '1992-11-25', '/uploads/licenses/license_004.jpg', 1),
(8, 'B2', 'DL-2024-001238', '1985-07-30', '/uploads/licenses/license_005.jpg', 2),
(9, 'C', 'DL-2024-001239', '1987-02-14', '/uploads/licenses/license_006.jpg', 2),
(10, 'B2', 'DL-2024-001240', '1993-06-08', '/uploads/licenses/license_007.jpg', 3),
(11, 'B1', 'DL-2024-001241', '1998-12-01', '/uploads/licenses/license_008.jpg', 2),
(12, 'B2', 'DL-2024-001242', '1991-09-18', '/uploads/licenses/license_009.jpg', 2),
(13, 'B2', 'DL-2024-001243', '1989-04-22', '/uploads/licenses/license_010.jpg', 1);

-- =========================
-- DRIVERS (10 drivers for with-driver service)
-- =========================
INSERT INTO drivers (full_name, phone, status_id) VALUES
('Nguyễn Văn Tài', '0901234567', 1),
('Trần Minh Hoàng', '0912345678', 1),
('Lê Thành Long', '0923456789', 1),
('Phạm Đức Trung', '0934567890', 2),
('Hoàng Văn Phúc', '0945678901', 1),
('Vũ Thanh Hải', '0956789012', 1),
('Đỗ Quang Vinh', '0967890123', 2),
('Bùi Minh Khoa', '0978901234', 1),
('Ngô Văn Sơn', '0989012345', 1),
('Đinh Quốc Khánh', '0990123456', 1);

-- =========================
-- SERVICE PRICING
-- =========================
INSERT INTO driver_pricing (daily_fee, effective_from, effective_to, is_active) VALUES
(30.00, '2024-01-01', NULL, TRUE),
(35.00, '2024-06-01', NULL, FALSE);

INSERT INTO delivery_pricing (base_fee, effective_from, effective_to, is_active) VALUES
(15.00, '2024-01-01', NULL, TRUE),
(20.00, '2024-06-01', NULL, FALSE);

-- =========================
-- BOOKINGS (25 bookings với nhiều trạng thái khác nhau)
-- =========================
INSERT INTO bookings (booking_code, vehicle_id, user_id, rental_type_id, pickup_method_id, driver_id, customer_name, customer_email, start_date, end_date, daily_rate, rental_fee, driver_fee, delivery_fee, total_amount, status_id) VALUES
-- COMPLETED bookings (10)
('BK-2025-0001', 1, 4, 1, 1, NULL, 'Phạm Ngọc Minh', 'minhpn@gmail.com', '2025-01-05', '2025-01-08', 85.00, 255.00, 0.00, 0.00, 255.00, 4),
('BK-2025-0002', 6, 5, 1, 2, NULL, 'Hoàng Thị Lan', 'lanhth@gmail.com', '2025-01-06', '2025-01-10', 55.00, 220.00, 0.00, 15.00, 235.00, 4),
('BK-2025-0003', 11, 6, 2, 1, 1, 'Vũ Đức Anh', 'anhvd@gmail.com', '2025-01-07', '2025-01-09', 48.00, 96.00, 60.00, 0.00, 156.00, 4),
('BK-2025-0004', 16, 7, 1, 1, NULL, 'Nguyễn Mai Hương', 'huongnm@gmail.com', '2025-01-08', '2025-01-12', 90.00, 360.00, 0.00, 0.00, 360.00, 4),
('BK-2025-0005', 3, 8, 2, 2, 2, 'Trần Quốc Bảo', 'baotq@gmail.com', '2025-01-09', '2025-01-11', 110.00, 220.00, 60.00, 15.00, 295.00, 4),
('BK-2025-0006', 12, 9, 1, 1, NULL, 'Lê Thị Kim Chi', 'chiltk@gmail.com', '2025-01-10', '2025-01-15', 70.00, 350.00, 0.00, 0.00, 350.00, 4),
('BK-2025-0007', 19, 10, 2, 1, 3, 'Đặng Văn Tùng', 'tungdv@gmail.com', '2025-01-11', '2025-01-13', 95.00, 190.00, 60.00, 0.00, 250.00, 4),
('BK-2025-0008', 24, 11, 1, 2, NULL, 'Bùi Thị Phương', 'phuongbt@gmail.com', '2025-01-12', '2025-01-14', 130.00, 260.00, 0.00, 15.00, 275.00, 4),
('BK-2025-0009', 29, 12, 1, 1, NULL, 'Ngô Hữu Nam', 'namnh@gmail.com', '2025-01-13', '2025-01-16', 50.00, 150.00, 0.00, 0.00, 150.00, 4),
('BK-2025-0010', 2, 13, 2, 2, 5, 'Hồ Minh Tuấn', 'tuanhm@gmail.com', '2025-01-14', '2025-01-17', 95.00, 285.00, 90.00, 15.00, 390.00, 4),

-- IN_PROGRESS bookings (5)
('BK-2025-0011', 4, 14, 1, 1, NULL, 'Dương Thị Thu', 'thudt@gmail.com', '2025-01-20', '2025-01-28', 200.00, 1600.00, 0.00, 0.00, 1600.00, 3),
('BK-2025-0012', 10, 15, 2, 1, 4, 'Phan Văn Đức', 'ducpv@gmail.com', '2025-01-22', '2025-01-29', 65.00, 455.00, 210.00, 0.00, 665.00, 3),
('BK-2025-0013', 15, 16, 1, 2, NULL, 'Lý Thị Hồng', 'honglth@gmail.com', '2025-01-23', '2025-01-30', 115.00, 805.00, 0.00, 15.00, 820.00, 3),
('BK-2025-0014', 21, 17, 2, 1, 7, 'Châu Văn Long', 'longcv@gmail.com', '2025-01-24', '2025-01-31', 65.00, 455.00, 210.00, 0.00, 665.00, 3),

-- CONFIRMED bookings (5)
('BK-2025-0015', 5, 18, 1, 1, NULL, 'Mai Thị Ngọc', 'ngocmt@gmail.com', '2025-01-28', '2025-02-02', 180.00, 900.00, 0.00, 0.00, 900.00, 2),
('BK-2025-0016', 7, 19, 2, 2, 8, 'Đinh Công Thành', 'thanhdc@gmail.com', '2025-01-29', '2025-02-03', 90.00, 450.00, 150.00, 15.00, 615.00, 2),
('BK-2025-0017', 13, 20, 1, 1, NULL, 'Võ Thị Lan Anh', 'anhvtl@gmail.com', '2025-01-30', '2025-02-05', 100.00, 600.00, 0.00, 0.00, 600.00, 2),
('BK-2025-0018', 17, 4, 1, 2, NULL, 'Phạm Ngọc Minh', 'minhpn@gmail.com', '2025-02-01', '2025-02-07', 95.00, 570.00, 0.00, 15.00, 585.00, 2),
('BK-2025-0019', 22, 5, 2, 1, 9, 'Hoàng Thị Lan', 'lanhth@gmail.com', '2025-02-02', '2025-02-10', 180.00, 1440.00, 240.00, 0.00, 1680.00, 2),

-- PENDING bookings (3)
('BK-2025-0020', 25, 6, 1, 1, NULL, 'Vũ Đức Anh', 'anhvd@gmail.com', '2025-02-05', '2025-02-10', 190.00, 950.00, 0.00, 0.00, 950.00, 1),
('BK-2025-0021', 26, 7, 2, 2, 10, 'Nguyễn Mai Hương', 'huongnm@gmail.com', '2025-02-08', '2025-02-15', 110.00, 770.00, 210.00, 15.00, 995.00, 1),
('BK-2025-0022', 28, 8, 1, 1, NULL, 'Trần Quốc Bảo', 'baotq@gmail.com', '2025-02-10', '2025-02-14', 250.00, 1000.00, 0.00, 0.00, 1000.00, 1),

-- CANCELLED bookings (2)
('BK-2025-0023', 18, 9, 1, 1, NULL, 'Lê Thị Kim Chi', 'chiltk@gmail.com', '2025-01-18', '2025-01-22', 60.00, 240.00, 0.00, 0.00, 240.00, 5),
('BK-2025-0024', 20, 10, 2, 2, 6, 'Đặng Văn Tùng', 'tungdv@gmail.com', '2025-01-19', '2025-01-25', 140.00, 840.00, 180.00, 15.00, 1035.00, 5);

-- =========================
-- HANDOVER RECORDS (for IN_PROGRESS and COMPLETED)
-- =========================
INSERT INTO handover_records (booking_id, battery_level, odometer, exterior_condition_id, interior_condition_id) VALUES
(1, 100, 15420, 1, 1),
(2, 95, 8750, 1, 1),
(3, 100, 22100, 1, 1),
(4, 98, 31200, 1, 1),
(5, 100, 5600, 1, 1),
(6, 92, 18900, 1, 1),
(7, 100, 12350, 1, 1),
(8, 96, 27800, 1, 1),
(9, 100, 3200, 1, 1),
(10, 94, 16700, 1, 1),
(11, 100, 45200, 1, 1),
(12, 97, 9100, 1, 1),
(13, 100, 38500, 1, 1),
(14, 95, 7800, 1, 1);

-- =========================
-- INSPECTIONS (for COMPLETED bookings)
-- =========================
INSERT INTO inspections (booking_id, battery_level, odometer, exterior_condition_id, interior_condition_id, has_damage) VALUES
(1, 35, 15850, 1, 1, FALSE),
(2, 42, 9180, 1, 1, FALSE),
(3, 28, 22450, 1, 1, FALSE),
(4, 55, 31720, 1, 1, FALSE),
(5, 18, 5920, 1, 2, TRUE),
(6, 40, 19430, 1, 1, FALSE),
(7, 62, 12680, 1, 1, FALSE),
(8, 30, 28150, 1, 1, FALSE),
(9, 75, 3510, 1, 1, FALSE),
(10, 25, 17180, 2, 1, TRUE);

-- =========================
-- INVOICES
-- =========================
INSERT INTO invoices (invoice_number, booking_id, rental_fee, driver_fee, delivery_fee, damage_fee, total_amount, payment_status_id) VALUES
('INV-2025-0001', 1, 255.00, 0.00, 0.00, 0.00, 255.00, 2),
('INV-2025-0002', 2, 220.00, 0.00, 15.00, 0.00, 235.00, 2),
('INV-2025-0003', 3, 96.00, 60.00, 0.00, 0.00, 156.00, 2),
('INV-2025-0004', 4, 360.00, 0.00, 0.00, 0.00, 360.00, 2),
('INV-2025-0005', 5, 220.00, 60.00, 15.00, 50.00, 345.00, 2),
('INV-2025-0006', 6, 350.00, 0.00, 0.00, 0.00, 350.00, 2),
('INV-2025-0007', 7, 190.00, 60.00, 0.00, 0.00, 250.00, 2),
('INV-2025-0008', 8, 260.00, 0.00, 15.00, 0.00, 275.00, 2),
('INV-2025-0009', 9, 150.00, 0.00, 0.00, 0.00, 150.00, 2),
('INV-2025-0010', 10, 285.00, 90.00, 15.00, 100.00, 490.00, 2);

-- =========================
-- PAYMENTS
-- =========================
INSERT INTO payments (invoice_id, amount, payment_method_id, payment_status_id) VALUES
(1, 255.00, 1, 1),
(2, 235.00, 2, 1),
(3, 156.00, 3, 1),
(4, 360.00, 1, 1),
(5, 345.00, 2, 1),
(6, 350.00, 3, 1),
(7, 250.00, 1, 1),
(8, 275.00, 2, 1),
(9, 150.00, 1, 1),
(10, 490.00, 3, 1);

-- =========================
-- VEHICLE LOCATIONS (GPS tracking data)
-- =========================
INSERT INTO vehicle_last_location (vehicle_id, latitude, longitude, recorded_at) VALUES
(1, 21.0285000, 105.8542000, NOW()),
(2, 21.0355000, 105.8480000, NOW()),
(3, 10.7769000, 106.7009000, NOW()),
(4, 10.7820000, 106.6950000, NOW()),
(5, 16.0544000, 108.2022000, NOW()),
(6, 21.0120000, 105.8200000, NOW()),
(7, 21.0450000, 105.8100000, NOW()),
(8, 10.8000000, 106.6700000, NOW()),
(9, 21.0300000, 105.8400000, NOW()),
(10, 10.7900000, 106.6800000, NOW());

INSERT INTO vehicle_locations (vehicle_id, latitude, longitude, recorded_at) VALUES
-- Vehicle 1 location history
(1, 21.0285000, 105.8542000, '2025-01-26 08:00:00'),
(1, 21.0300000, 105.8500000, '2025-01-26 09:00:00'),
(1, 21.0320000, 105.8460000, '2025-01-26 10:00:00'),
-- Vehicle 2 location history
(2, 21.0355000, 105.8480000, '2025-01-26 08:00:00'),
(2, 21.0370000, 105.8450000, '2025-01-26 09:00:00'),
-- Vehicle 3 location history
(3, 10.7769000, 106.7009000, '2025-01-26 08:00:00'),
(3, 10.7800000, 106.6950000, '2025-01-26 09:00:00'),
(3, 10.7850000, 106.6900000, '2025-01-26 10:00:00');
