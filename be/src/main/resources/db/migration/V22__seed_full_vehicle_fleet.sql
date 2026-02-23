-- =========================================================
-- V22: Seed full vehicle fleet (idempotent)
-- Adds additional vehicle models + pricing + images + physical vehicles
-- for current V19+ schema.
-- =========================================================

DROP TEMPORARY TABLE IF EXISTS tmp_v22_vehicle_seed;

CREATE TEMPORARY TABLE tmp_v22_vehicle_seed (
  brand VARCHAR(80) NOT NULL,
  name VARCHAR(120) NOT NULL,
  model VARCHAR(120) NOT NULL,
  seats INT NOT NULL,
  battery_capacity_kwh DECIMAL(6,2) NOT NULL,
  range_km INT NOT NULL,
  charging_time_hours DECIMAL(5,2) NOT NULL,
  description TEXT NULL,
  image_url VARCHAR(500) NOT NULL,
  daily_price DECIMAL(15,2) NOT NULL,
  license_plate VARCHAR(20) NOT NULL,
  status VARCHAR(30) NOT NULL,
  vin VARCHAR(50) NOT NULL,
  odometer INT NOT NULL,
  current_battery_percent INT NOT NULL
);

INSERT INTO tmp_v22_vehicle_seed (
  brand, name, model, seats, battery_capacity_kwh, range_km, charging_time_hours,
  description, image_url, daily_price, license_plate, status, vin, odometer, current_battery_percent
) VALUES
-- Tesla
('Tesla', 'Model 3', 'Standard', 5, 60.00, 438, 6.50, 'Tesla Model 3 Standard EV', 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800', 2125000, '30A-12345', 'AVAILABLE', 'V22-30A12345', 15420, 95),
('Tesla', 'Model 3', 'Long Range', 5, 75.00, 568, 8.00, 'Tesla Model 3 Long Range EV', 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800', 2375000, '30A-12346', 'AVAILABLE', 'V22-30A12346', 8750, 98),
('Tesla', 'Model Y', 'Standard', 5, 75.00, 533, 8.00, 'Tesla Model Y electric SUV', 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800', 2750000, '30A-12347', 'AVAILABLE', 'V22-30A12347', 22100, 88),
('Tesla', 'Model S', 'Plaid', 5, 100.00, 637, 12.00, 'Tesla Model S Plaid high-performance EV', 'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&q=80&w=800', 5000000, '30A-12348', 'RENTED', 'V22-30A12348', 5600, 65),
('Tesla', 'Model X', 'Long Range', 7, 100.00, 560, 10.00, 'Tesla Model X premium electric SUV', 'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&q=80&w=800', 4500000, '30A-12349', 'AVAILABLE', 'V22-30A12349', 9800, 92),

-- VinFast
('VinFast', 'VF e34', 'Standard', 5, 42.00, 285, 6.00, 'VinFast VF e34 compact EV', 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800', 1375000, '29A-11111', 'AVAILABLE', 'V22-29A11111', 12000, 92),
('VinFast', 'VF 8', 'Standard', 5, 87.70, 420, 8.00, 'VinFast VF 8 midsize electric SUV', 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800', 2250000, '29A-11112', 'AVAILABLE', 'V22-29A11112', 8500, 97),
('VinFast', 'VF 9', 'Eco', 7, 123.00, 438, 11.00, 'VinFast VF 9 full-size electric SUV', 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800', 3750000, '29A-11113', 'AVAILABLE', 'V22-29A11113', 18900, 78),
('VinFast', 'VF 5', 'Standard', 5, 37.23, 300, 5.50, 'VinFast VF 5 city EV', 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800', 1125000, '29A-11114', 'AVAILABLE', 'V22-29A11114', 6500, 99),
('VinFast', 'VF 6', 'Standard', 5, 59.60, 399, 7.00, 'VinFast VF 6 compact crossover EV', 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800', 1625000, '29A-11115', 'RENTED', 'V22-29A11115', 14200, 61),

-- BYD
('BYD', 'Dolphin', 'Standard', 5, 44.90, 340, 5.00, 'BYD Dolphin hatchback EV', 'https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&q=80&w=800', 1200000, '51A-22221', 'AVAILABLE', 'V22-51A22221', 14200, 90),
('BYD', 'Atto 3', 'Standard', 5, 60.48, 420, 6.00, 'BYD Atto 3 crossover EV', 'https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&q=80&w=800', 1750000, '51A-22222', 'AVAILABLE', 'V22-51A22222', 9800, 87),
('BYD', 'Seal', 'Performance', 5, 82.56, 570, 7.50, 'BYD Seal performance electric sedan', 'https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&q=80&w=800', 2500000, '51A-22223', 'AVAILABLE', 'V22-51A22223', 15600, 85),
('BYD', 'Tang EV', 'Standard', 7, 108.80, 530, 9.00, 'BYD Tang EV 7-seat SUV', 'https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&q=80&w=800', 3250000, '51A-22224', 'AVAILABLE', 'V22-51A22224', 12100, 84),
('BYD', 'Han EV', 'Premium', 5, 85.40, 610, 8.50, 'BYD Han EV premium sedan', 'https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&q=80&w=800', 2875000, '51A-22225', 'RENTED', 'V22-51A22225', 17350, 58),

-- Hyundai
('Hyundai', 'Ioniq 5', 'Long Range', 5, 77.40, 481, 7.00, 'Hyundai Ioniq 5 electric crossover', 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=800', 2250000, '43A-33331', 'AVAILABLE', 'V22-43A33331', 11200, 95),
('Hyundai', 'Ioniq 6', 'Standard', 5, 77.40, 614, 7.50, 'Hyundai Ioniq 6 aerodynamic EV sedan', 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=800', 2375000, '43A-33332', 'AVAILABLE', 'V22-43A33332', 14600, 90),
('Hyundai', 'Kona Electric', 'Standard', 5, 64.00, 400, 6.00, 'Hyundai Kona Electric compact SUV', 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=800', 1500000, '43A-33333', 'AVAILABLE', 'V22-43A33333', 9800, 93),

-- Kia
('Kia', 'EV6', 'GT-Line', 5, 77.40, 510, 7.00, 'Kia EV6 sporty crossover EV', 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=800', 2375000, '92A-44441', 'AVAILABLE', 'V22-92A44441', 13500, 88),
('Kia', 'EV9', 'Standard', 7, 99.80, 541, 9.00, 'Kia EV9 full-size electric SUV', 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=800', 3500000, '92A-44442', 'AVAILABLE', 'V22-92A44442', 9200, 94),
('Kia', 'Niro EV', 'Standard', 5, 64.80, 460, 7.00, 'Kia Niro EV compact crossover', 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=800', 1625000, '92A-44443', 'RENTED', 'V22-92A44443', 18950, 57),

-- Mercedes
('Mercedes', 'EQS 450+', 'Sedan', 5, 107.80, 780, 11.00, 'Mercedes EQS flagship electric sedan', 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800', 5500000, '30A-55551', 'AVAILABLE', 'V22-30A55551', 7300, 96),
('Mercedes', 'EQE SUV', 'Standard', 5, 90.60, 590, 9.50, 'Mercedes EQE electric SUV', 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800', 4500000, '30A-55552', 'AVAILABLE', 'V22-30A55552', 8600, 91),

-- BMW
('BMW', 'i4 eDrive40', 'Gran Coupe', 5, 83.90, 590, 8.00, 'BMW i4 Gran Coupe EV', 'https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&q=80&w=800', 3250000, '30A-66661', 'AVAILABLE', 'V22-30A66661', 10200, 93),
('BMW', 'iX xDrive50', 'SUV', 5, 111.50, 630, 10.00, 'BMW iX premium electric SUV', 'https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&q=80&w=800', 4750000, '30A-66662', 'AVAILABLE', 'V22-30A66662', 9100, 94),

-- Audi
('Audi', 'Q4 e-tron', 'Standard', 5, 82.00, 520, 8.00, 'Audi Q4 e-tron electric SUV', 'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&q=80&w=800', 2750000, '30A-77771', 'AVAILABLE', 'V22-30A77771', 12500, 89),
('Audi', 'e-tron GT', 'Performance', 5, 93.40, 488, 9.00, 'Audi e-tron GT high-performance EV', 'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&q=80&w=800', 5000000, '30A-77772', 'AVAILABLE', 'V22-30A77772', 7800, 92),

-- Porsche
('Porsche', 'Taycan 4S', 'Standard', 5, 93.40, 452, 9.00, 'Porsche Taycan 4S electric sports sedan', 'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&q=80&w=800', 6250000, '30A-88881', 'AVAILABLE', 'V22-30A88881', 6400, 95),

-- MG
('MG', 'ZS EV', 'Standard', 5, 50.30, 403, 7.00, 'MG ZS EV urban SUV', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800', 1250000, '36A-99991', 'AVAILABLE', 'V22-36A99991', 14100, 90),
('MG', 'MG4', 'Standard', 5, 64.00, 450, 7.50, 'MG4 compact electric hatchback', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800', 1375000, '36A-99992', 'AVAILABLE', 'V22-36A99992', 9500, 92);

-- 1) Category (brand + name + model) - insert missing only
INSERT INTO vehicle_categories (
  brand, name, model, seats, battery_capacity_kwh, range_km, charging_time_hours, description
)
SELECT
  s.brand, s.name, s.model, s.seats, s.battery_capacity_kwh, s.range_km, s.charging_time_hours, s.description
FROM (
  SELECT DISTINCT
    brand, name, model, seats, battery_capacity_kwh, range_km, charging_time_hours, description
  FROM tmp_v22_vehicle_seed
) s
LEFT JOIN vehicle_categories vc
  ON vc.brand = s.brand AND vc.name = s.name AND vc.model = s.model
WHERE vc.id IS NULL;

-- 2) Primary image for each category - insert if category has no primary image yet
INSERT INTO vehicle_category_images (vehicle_category_id, image_url, is_primary, sort_order)
SELECT
  vc.id,
  s.image_url,
  TRUE,
  0
FROM (
  SELECT DISTINCT brand, name, model, image_url
  FROM tmp_v22_vehicle_seed
) s
JOIN vehicle_categories vc
  ON vc.brand = s.brand AND vc.name = s.name AND vc.model = s.model
LEFT JOIN vehicle_category_images img
  ON img.vehicle_category_id = vc.id
  AND img.is_primary = TRUE
WHERE img.id IS NULL;

-- 3) Pricing per category - insert active pricing if missing
INSERT INTO pricing (
  vehicle_category_id,
  daily_price,
  weekly_price,
  monthly_price,
  overtime_fee_per_hour,
  effective_from,
  effective_to,
  is_active
)
SELECT
  vc.id,
  s.daily_price,
  ROUND(s.daily_price * 6, 0),
  LEAST(ROUND(s.daily_price * 20, 0), 99999999.99),
  ROUND(s.daily_price * 0.1, 0),
  '2026-02-23',
  NULL,
  TRUE
FROM (
  SELECT DISTINCT brand, name, model, daily_price
  FROM tmp_v22_vehicle_seed
) s
JOIN vehicle_categories vc
  ON vc.brand = s.brand AND vc.name = s.name AND vc.model = s.model
LEFT JOIN pricing p
  ON p.vehicle_category_id = vc.id
  AND p.is_active = TRUE
  AND p.effective_to IS NULL
WHERE p.id IS NULL;

-- 4) Physical vehicles - insert missing by license_plate / vin
INSERT INTO vehicles (
  vehicle_category_id,
  license_plate,
  status,
  vin,
  odometer,
  current_battery_percent
)
SELECT
  vc.id,
  s.license_plate,
  s.status,
  s.vin,
  s.odometer,
  s.current_battery_percent
FROM tmp_v22_vehicle_seed s
JOIN vehicle_categories vc
  ON vc.brand = s.brand AND vc.name = s.name AND vc.model = s.model
LEFT JOIN vehicles v_plate
  ON v_plate.license_plate = s.license_plate
LEFT JOIN vehicles v_vin
  ON v_vin.vin = s.vin
WHERE v_plate.id IS NULL
  AND v_vin.id IS NULL;

DROP TEMPORARY TABLE IF EXISTS tmp_v22_vehicle_seed;
