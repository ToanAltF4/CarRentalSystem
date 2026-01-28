

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Insert Categories (with explicit IDs to match Vehicle references)
-- We use ON DUPLICATE KEY UPDATE to prevent errors if run multiple times
INSERT INTO vehicle_categories (id, name, description) VALUES
(1, 'Sedan', 'Premium electric sedan'),
(2, 'SUV', 'Electric SUV for all terrains'),
(3, 'Compact', 'Small economy electric car'),
(4, 'Luxury', 'High-end luxury electric vehicle'),
(5, 'Crossover', 'Versatile electric crossover')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- 2. Insert Vehicles
INSERT INTO vehicles (name, model, brand, license_plate, battery_capacity_kwh, range_km, charging_time_hours, daily_rate, status, seats, image_url, description, category_id) VALUES
-- Tesla
('Tesla Model 3', 'Model 3 Long Range', 'Tesla', '51A-111.11', 82.00, 580, 8.50, 1500000, 'AVAILABLE', 5, 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800', 'Tesla Model 3 Long Range with Autopilot self-driving capability', 1),
('Tesla Model Y', 'Model Y Performance', 'Tesla', '51A-222.22', 75.00, 480, 7.00, 1800000, 'AVAILABLE', 5, 'https://images.unsplash.com/photo-1619317120246-c9ef5e90649d?w=800', 'High-performance Tesla Model Y SUV with spacious interior', 2),
('Tesla Model S', 'Model S Plaid', 'Tesla', '51A-333.33', 100.00, 650, 10.00, 2500000, 'AVAILABLE', 5, 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=800', 'Tesla flagship sedan with 0-100km/h in 2.1 seconds', 4),
('Tesla Model X', 'Model X Long Range', 'Tesla', '51A-444.44', 100.00, 560, 10.00, 2800000, 'RENTED', 7, 'https://images.unsplash.com/photo-1566055909643-a51b4271aa47?w=800', 'Premium electric SUV with iconic falcon-wing doors', 4),
-- VinFast
('VinFast VF e34', 'VF e34 Standard', 'VinFast', '30A-555.55', 42.00, 285, 6.00, 600000, 'AVAILABLE', 5, 'https://images.unsplash.com/photo-1680469786155-e36b0e36c0d0?w=800', 'Vietnamese electric car ideal for city commuting', 3),
('VinFast VF 8', 'VF 8 Plus', 'VinFast', '30A-666.66', 87.70, 420, 8.00, 1200000, 'AVAILABLE', 5, 'https://images.unsplash.com/photo-1680469786147-5e6cd3ac85cf?w=800', 'VinFast VF 8 electric SUV with advanced ADAS technology', 2),
('VinFast VF 9', 'VF 9 Eco', 'VinFast', '30A-777.77', 123.00, 594, 11.00, 1800000, 'MAINTENANCE', 7, 'https://images.unsplash.com/photo-1680469786126-a6a1d4f7e6e8?w=800', 'VinFast flagship 7-seater luxury electric SUV', 4),
('VinFast VF 5', 'VF 5 Plus', 'VinFast', '30A-888.88', 37.23, 300, 5.50, 450000, 'AVAILABLE', 5, 'https://images.unsplash.com/photo-1680469786179-2c8e1c0f0e4d?w=800', 'Compact urban electric car, perfect for students', 3),
-- BYD
('BYD Seal', 'Seal Performance', 'BYD', '51A-999.99', 82.56, 570, 7.50, 1300000, 'AVAILABLE', 5, 'https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?w=800', 'Sporty electric sedan with aerodynamic design from BYD', 1),
('BYD Atto 3', 'Atto 3 Extended', 'BYD', '51A-101.01', 60.48, 420, 6.00, 900000, 'AVAILABLE', 5, 'https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?w=800', 'BYD Atto 3 crossover with gym-inspired interior', 5),
('BYD Dolphin', 'Dolphin Standard', 'BYD', '51A-102.02', 44.90, 340, 5.00, 550000, 'AVAILABLE', 5, 'https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?w=800', 'Compact electric car with youthful design', 3),
-- Hyundai
('Hyundai Ioniq 5', 'Ioniq 5 Long Range', 'Hyundai', '29A-111.22', 77.40, 481, 7.00, 1100000, 'AVAILABLE', 5, 'https://images.unsplash.com/photo-1681469787982-d1b3e2e0f31e?w=800', 'Hyundai electric crossover with unique retro-futuristic design', 5),
('Hyundai Ioniq 6', 'Ioniq 6 Standard', 'Hyundai', '29A-222.33', 77.40, 614, 7.50, 1400000, 'RENTED', 5, 'https://images.unsplash.com/photo-1681469787982-d1b3e2e0f31e?w=800', 'Aerodynamic electric sedan with lowest drag coefficient in class', 1),
('Hyundai Kona Electric', 'Kona Electric Standard', 'Hyundai', '29A-333.44', 64.00, 400, 6.00, 750000, 'AVAILABLE', 5, 'https://images.unsplash.com/photo-1681469787982-d1b3e2e0f31e?w=800', 'Compact electric SUV perfect for families', 2),
-- Kia
('Kia EV6', 'EV6 GT-Line', 'Kia', '30A-444.55', 77.40, 510, 7.00, 1200000, 'AVAILABLE', 5, 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800', 'Bold Kia EV6 crossover with 800V ultra-fast charging', 5),
('Kia EV9', 'EV9 Land', 'Kia', '30A-555.66', 99.80, 541, 9.00, 2000000, 'AVAILABLE', 7, 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800', 'Large 7-seater electric SUV with lounge-like interior', 4),
-- Mercedes-Benz
('Mercedes EQS', 'EQS 450+', 'Mercedes-Benz', '51A-666.77', 107.80, 780, 11.00, 3500000, 'AVAILABLE', 5, 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800', 'Mercedes flagship electric sedan with MBUX Hyperscreen', 4),
('Mercedes EQE', 'EQE 350+', 'Mercedes-Benz', '51A-777.88', 90.56, 654, 9.50, 2800000, 'MAINTENANCE', 5, 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800', 'Mid-size sporty electric sedan from Mercedes', 4),
('Mercedes EQB', 'EQB 250+', 'Mercedes-Benz', '51A-888.99', 66.50, 419, 7.00, 1800000, 'AVAILABLE', 7, 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800', 'Compact 7-seater electric SUV for families', 2),
-- BMW
('BMW iX', 'iX xDrive50', 'BMW', '30A-999.00', 111.50, 630, 10.00, 3000000, 'AVAILABLE', 5, 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800', 'Premium BMW electric SUV with iDrive 8 technology', 4),
('BMW i4', 'i4 eDrive40', 'BMW', '30A-000.11', 83.90, 590, 8.00, 1600000, 'AVAILABLE', 5, 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800', 'BMW i4 Gran Coupe with signature sporty driving dynamics', 1);

SET FOREIGN_KEY_CHECKS = 1;
